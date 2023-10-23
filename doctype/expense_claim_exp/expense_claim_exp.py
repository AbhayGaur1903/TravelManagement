# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

# class ExpenseClaimEXP(Document):
#     def before_save(self):
#       total_transportation_amount = 0
#       total_transportation_amount_self = 0
#       total_lodging_amount = 0
#       total_meal_amount = 0
#       total_conveyance_amount = 0 
#       total_sundries_amount = 0 
#       total_expense = 0
      
#       if(not self.is_new()):
#         for row in self.transportation_details:
#             if (self.transport_booked_by_company == 1):
#               total_transportation_amount += row.paid_by_company_amount
              
            
              
#         for row in self.transportation_details_self:
#             total_transportation_amount_self += row.paid_by_self_amount

             

#         for row in self.stay_details:
#             # total_lodging_amount += row.paid_by_company_amount
#             total_lodging_amount += row.paid_by_self_amount
#             total_expense += row.paid_by_self_amount

#         for row in self.refreshment_details:
#             total_meal_amount += row.amount
#             total_expense += row.amount

#         for row in self.local_details:
#             total_conveyance_amount += row.amount
#             total_expense += row.amount

#         for row in self.sundries_detail:
#             total_sundries_amount += row.amount
#             total_expense += row.amount

      

#       self.total_fare_amount = total_transportation_amount_self
#       self.total_lodging_amount = total_lodging_amount
#       self.total_meal_amount = total_meal_amount
#       self.total_conveyance_amount = total_conveyance_amount 
#       self.total_sundries_amount = total_sundries_amount
#       self.total_expense = total_expense

#       total_advance= get_advance_list(self.travel_request_id,self.employee_id)
#       self.advance_availed = total_advance
#       self.balance = total_expense - total_advance

class ExpenseClaimEXP(Document):
    def before_save(self):
      total_transportation_amount = 0
      total_transportation_amount_self = 0
      total_lodging_amount = 0
      total_meal_amount = 0
      total_conveyance_amount = 0 
      total_sundries_amount = 0 
      total_expense = 0
      
      
      if(not self.is_new()):
        for row in self.transportation_details:
            if (self.transport_booked_by_company == 1):
              total_transportation_amount += row.paid_by_company_amount
              
            
              
        for row in self.transportation_details_self:
            total_transportation_amount_self += row.paid_by_self_amount

             

        # for row in self.stay_details:
        #     # total_lodging_amount += row.paid_by_company_amount
        #     if (self.stay_booked_by_company == 1):
        #       total_lodging_amount += row.paid_by_self_amount
            
            
        for row in self.stay_details_self:
            total_lodging_amount += row.paid_by_self_amount
            total_expense += row.paid_by_self_amount
            

        for row in self.refreshment_details:
            total_meal_amount += row.amount
            total_expense += row.amount

        for row in self.local_details:
            total_conveyance_amount += row.amount
            total_expense += row.amount

        for row in self.sundries_detail:
            total_sundries_amount += row.amount
            total_expense += row.amount

      

      self.total_fare_amount = total_transportation_amount_self
      self.total_lodging_amount = total_lodging_amount
      self.total_meal_amount = total_meal_amount
      self.total_conveyance_amount = total_conveyance_amount 
      self.total_sundries_amount = total_sundries_amount
      self.total_expense = total_expense


      total_advance= get_advance_list(self.travel_request_id,self.employee_id)
      self.advance_availed = total_advance
      self.balance = total_expense - total_advance
     
      
      if self.expense_issued:
          self.balance = self.balance - self.expense_issued
            
            
@frappe.whitelist()
def get_transport_details(travel_docname):
    travel_request = frappe.get_doc("Travel Request EXP", travel_docname)
    booking_details = []
    for row in travel_request.booking_detals:
        transport_details = frappe.get_value("Booking Status EXP", {"parent": travel_docname, "name": row.name}, ["journey_type", "mode", "booking_amount"])
        booking_details.append(transport_details)
      
    # frappe.msgprint(str(booking_details))
    return booking_details


@frappe.whitelist()
def get_advance_list(travel_req_id, emp_id):
    list_advance = frappe.db.get_list('Advance Request EXP',
                                      filters={
                                          'travel_request_id': travel_req_id,
                                          'employee_id': emp_id
                                      },
                                      fields=['advance_issued'],
                                      as_list=True
                                     )
    total_advance = sum(float(item[0]) for item in list_advance)
    # frappe.msgprint("Total Advance: " + str(total_advance))
    return total_advance
  

@frappe.whitelist()
def check_existing_expense_claim(travel_request_id, employee_id):
    existing_expense_claim = frappe.db.exists(
        "Expense Claim EXP",
        {
            "travel_request_id": travel_request_id,
            "employee_id": employee_id
        }
    )
    return existing_expense_claim



@frappe.whitelist()
def get_advance__list_promt(employee_id,travel_request_exp):
    
    list_advance = frappe.db.get_list('Advance Request EXP',
                                      filters={
                                          'travel_request_id': travel_request_exp,
                                          'employee_id': employee_id
                                      },
                                      fields=['name'],
                                      as_list=True
                                     )

    advance_issued_list = get_advance_issues(list_advance)
    html_table = update_advance_paid_details_table(advance_issued_list)
    
    return html_table


def get_advance_issues(list_advance):
    parent_values = [d[0] for d in list_advance]  # Extracting the first element (name) from each tuple
    query = """
        SELECT date, advance_issued, payment_mode
        FROM `tabAvance Issued Details EXP`
        WHERE parent IN %(parent_values)s
    """
    advance_issued_list = frappe.db.sql(query, {"parent_values": parent_values}, as_dict=True)
    return advance_issued_list


def update_advance_paid_details_table(advance_issued_list):
    table_html = "<table style=\"border-collapse: collapse; width: 100%;\">"
    table_html += "<tr><th style=\"border: 1px solid black; padding: 8px;\">Date</th>"
    table_html += "<th style=\"border: 1px solid black; padding: 8px;\">Advance Issued</th>"
    table_html += "<th style=\"border: 1px solid black; padding: 8px;\">Payment Mode</th></tr>"

    for detail in advance_issued_list:
        date = detail['date']
        advance_issued = detail['advance_issued']
        payment_mode = detail['payment_mode']
        table_html += "<tr>"
        table_html += f"<td style=\"border: 1px solid black; padding: 8px;\">{date}</td>"
        table_html += f"<td style=\"border: 1px solid black; padding: 8px;\">{advance_issued}</td>"
        table_html += f"<td style=\"border: 1px solid black; padding: 8px;\">{payment_mode}</td>"
        table_html += "</tr>"

    table_html += "</table>"
    
    return table_html


@frappe.whitelist()
def get_stay_details(stay_docname):
    stay_request = frappe.get_doc("Travel Request EXP", stay_docname)
    hotel_details = []
    for row in stay_request.hotel_details:
        stay_details = frappe.get_value("Hotel Details EXP", {"parent": stay_docname, "name": row.name}, ["place", "hotel_name","total_fare",])
        hotel_details.append(stay_details)
      
    # frappe.msgprint(str(hotel_details))
    return hotel_details