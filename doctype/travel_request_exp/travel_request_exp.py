# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.naming import make_autoname
from frappe.model.naming import getseries
from frappe.share import add
from frappe import _
from frappe.utils import nowdate, nowtime, getdate
from datetime import datetime
import frappe
from frappe.utils import get_files_path
from frappe.model.document import Document
import os

class TravelRequestEXP(Document):
    def autoname(self):
        prefix = "EXP-TR-"
        travel_category = "G" if self.travel_category == "Group" else "I"
        naming_series = prefix + travel_category + "-{0}{1}-.#####".format(
            datetime.strftime(getdate(nowdate()), "%m"),
            datetime.strftime(getdate(nowdate()), "%Y")
        )
        self.name = make_autoname(naming_series)

    def on_change(self):
         user = frappe.session.data.get('user')
         if(not self.is_new() and self.owner == user):
              
              add_shared_users("Travel Request EXP", self.name)
   
    def before_save(self):
        if self.city:
            self.city_type = "City A EXP"
           
        else:
            self.city_type = "City B EXP" 
        # if(self.extended_dates):
        #     if(self.extended_dates < self.to_date):
        #         frappe.throw("Extended Date Should be after the previous trip end date")
            

    def before_submit(self):
        if not self.approver_comments:
            frappe.throw('Please provide a reason for rejection.', title='Validation Error')

            # Add a comment field for rejection comments
            comment = self.add_comment("Comment", "Please provide a reason for rejection.")
            comment.comment_type = "Comment"
            comment.save(ignore_permissions=True)
            comment.run_method("on_update")

            # Raise an exception to prevent submission
            frappe.throw('Please provide a reason for rejection.', title='Validation Error')

            #  frappe.throw('Please provide a reason for rejection.', title='Validation Error')
            #  frappe.throw("fill in approvers before rejecting")
              
@frappe.whitelist()
def get_list_context():
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("Employee EXP",{"email_id":email_id},["auto_id"])
    
    return data




@frappe.whitelist()
def add_shared_users(doctype, docname):
    # Delete all existing shares for the document
    frappe.db.delete("DocShare", {
        "share_name": docname,
        "share_doctype": doctype
    })

    # Retrieve the travel request document
    travel_request = frappe.get_doc(doctype, docname)
    approver_id = travel_request.approver
    
    
    user_mail = frappe.get_value("Employee EXP",{"name":approver_id}, "email_id")
    
    
    frappe.db.set_value(doctype,docname,'approving_user',user_mail,update_modified=False)
    
    email_ids = [user_mail]

    if(travel_request.travel_category ==  'test'):
        for employee in travel_request.employees_id_group:
            frappe.throw("Feature Deprecated")
            email_id = frappe.get_value("Employee EXP", employee.employees, "email_id")
            if email_id:
                email_ids.append(email_id)

    # Add shares for each email ID
    for email_id in email_ids:
        frappe.share.add(doctype, docname, email_id, read=1, write=1, share=1,submit=1)


@frappe.whitelist()
def get_session_data():
	session_data = frappe.session.data
	return session_data
	
@frappe.whitelist()
def get_dob():
	dob = frappe.session.data.get("date_of_birth")
	return dob

@frappe.whitelist()
def get_employee_details():

    email_id = frappe.session.data.get('user')
    data = frappe.get_value("Employee EXP",{"email_id":email_id},["name","grade"])
    return data  



@frappe.whitelist()
def send_ticket(docname, row_id):
    # Fetch the travel request document
    travel_request = frappe.get_doc("Travel Request EXP", docname)
    employee_emails = []
    email_subject= f'Your Travel Tickets for Travel Request- {docname}'
    email_body = "Dear , please find attached your ticket."
    
    if(travel_request.travel_category == 'Individual'):
        employee_emails = [frappe.get_value("Employee EXP", {"name": travel_request.employee_id}, "email_id")]

    else:
        for row in travel_request.employees_id_group:
            employee_email = frappe.get_value("Employee EXP", {"name":row.employees}, "email_id")
            employee_emails.append(employee_email)

    
    row = next((row for row in travel_request.booking_detals if str(row.idx) == row_id), None)
       
    if row:
        if row.ticket:
            file_path = get_files_path(row.ticket)
            new_file_path = f'/home/travel/frappe-bench/sites/Expedien.Travel/public{file_path}'
            with open(new_file_path, "rb") as file:
                file_content = file.read()
            filename = os.path.basename(new_file_path)
            send_email(file_content, filename,employee_emails,email_subject,email_body)
        else:
            frappe.throw("No ticket attached.")
    else:
        frappe.throw("Ticket not found.")   



# hotel ticket
@frappe.whitelist()
def send_hotel_ticket(docname, row_id):
    # Fetch the travel request document
    travel_request = frappe.get_doc("Travel Request EXP", docname)
    employee_emails = []
    email_subject = f"Your Hotel Voucher Against Travel Request {docname}"
    email_body = "Dear , please find attached your Hotel Voucher."


    if travel_request.travel_category == 'Individual':
        employee_emails = [frappe.get_value("Employee EXP", {"name": travel_request.employee_id}, "email_id")]
    else:
        for row in travel_request.employees_id_group:
            employee_email = frappe.get_value("Employee EXP", {"name": row.employees}, "email_id")
            employee_emails.append(employee_email)

    row = next((row for row in travel_request.hotel_details if str(row.idx) == row_id), None)

    if row:
        if row.hotel_ticket:
            file_path = get_files_path(row.hotel_ticket)
            new_file_path = f'/home/travel/frappe-bench/sites/Expedien.Travel/public{file_path}'
            with open(new_file_path, "rb") as file:
                file_content = file.read()
            filename = os.path.basename(new_file_path)
            send_email(file_content, filename, employee_emails,email_subject,email_body)
        else:
            frappe.throw("No ticket attached.")
    else:
        frappe.throw("Ticket not found.")

    
def send_email(ticket_contents, ticket_filename,employee_emails,email_subject1,email_body1):
    
    email_subject = email_subject1
    email_body = email_body1
    attachments = [{"fname": ticket_filename, "fcontent": ticket_contents}]
    frappe.sendmail(
        # recipients=employee_emails,
        recipients=['pvashista@expediens.com'],
        subject=email_subject,
        message=email_body,
        attachments=attachments,
        now=True
    )
    frappe.msgprint("Ticket Sent")

@frappe.whitelist()
def get_attached_files(docname):
    
    attached_files = frappe.db.get_list('File',
                            filters={
                                'attached_to_name': docname
                            },
                            fields=['file_name','file_url'],
                            as_list=True
                        )
    
    html = "<div style='padding-bottom: 20px;'>"
    html += "<table style='border-collapse: collapse; border: 2px solid #039dfc;'>"
    html += "<tr><th style='border: 1px solid #039dfc; background-color: #039dfc; color: white; padding: 10px;'>Attachment</th></tr>"
    for file_data in attached_files:
        file_name = file_data[0]
        file_url = file_data[1]
        
        button_html = '<button class="modern-button" onclick="window.open(\'{url}\')" type="button">{name}</button>'.format(url=file_url, name=file_name)
        row_html = "<tr><td style='border: 1px solid #039dfc; padding: 10px;'>{}</td></tr>".format(button_html)
        html += row_html

    # Add CSS styles for modern button look
    css = '<style>button.modern-button { background-color: #039dfc; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }</style>'
    html_with_styles = css + html + "</table></div>"
    frappe.msgprint(html_with_styles)
    return html_with_styles


    # # Get the file path of the attached ticket
    # file_path = get_files_path(travel_request.ticket)
    # new_file_path = f'/home/travel/frappe-bench/sites/Expedien.Travel/public{file_path}'
    # # Read the file content
    

    # # Compose the email
    # subject = "Your Travel Ticket"
    # message = "Please find attached your travel ticket."

    # # Fetch the employee's email ID
    # employee_email = frappe.get_value("Employee EXP", travel_request.employee_id, "email_id")
    # if not employee_email:
    #     frappe.throw("No email ID found for the employee.")

    # # Send the email with the ticket attachment
    # frappe.sendmail(
    #     recipients=[employee_email],
    #     subject=subject,
    #     message=message,
    #     attachments=[
    #         {
    #             "fname": travel_request.ticket,
    #             "content": file_content,
    #         }
    #     ],
    # )

    
    # travel_request.save()

    


# @frappe.whitelist()
# def get_list_conditions(filters):
#     # If the `approver` field is set to 'EXEMP-0034'
#     return _("`tabTravel Request EXP`.`approver` = 'EXEMP-0034'")

# def on_change(self):
#     add_shared_users("Travel Request EXP", self.name)


# @frappe.whitelist()
# def update_shared_users(doctype, docname):
#     travel_request = frappe.get_doc(doctype, docname)
#     updated_users = [row.employees for row in travel_request.employees_id_group]

#     shared_users = frappe.share.get_users(doctype, docname)

#     # Remove shared access for users not present in the updated employee_id_group
#     for user in shared_users:
#         print(f"{user}-------------------------------------------------------")
#         email_id = frappe.get_value("Employee EXP", user, "email_id")  # Updated line
#         if email_id not in updated_users:
#             frappe.share.remove(doctype, docname, email_id)

#     # Add shared access for new users in the updated employee_id_group
#     for user in updated_users:
#         print(f"{user}-------------------------------------------------------")
#         email_id = frappe.get_value("Employee EXP", user, "email_id")  # Updated line
#         if email_id and email_id not in shared_users:
#             frappe.share.add(doctype, docname, email_id, read=1, write=1, share=1)


# @frappe.whitelist()
# def add_shared_users(doctype, docname, users):
#     users_list = users.split(",")  # Split the string into a list of email IDs
#     for user in users_list:
#         frappe.share.add(doctype, docname, user.strip(), read=1, write=1, share=1)


# Example usage:
# doctype = "Travel Request EXP"
# docname = "EXP-TR-G-00004"
# users = ["pvashista@expediens.com", "anand@expediens.com"]

# add_shared_users(doctype, docname, users)