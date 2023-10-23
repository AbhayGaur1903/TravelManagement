import frappe
from frappe.model.document import Document
from frappe import throw, _
from datetime import datetime



class AdvanceRequestEXP(Document):
	def validate(self):
		lodging_allowance = 0
		daily_allowance = 0
		daily_allowance_gh = 0
		max_lodging = 0
		max_daily = 0
		days = 0

		if not self.is_new():
			for row in self.advance_request_details:
				if (row.days > 7 and row.days <= self.travel_days):
					frappe.throw("Days cannot be more than 7 or Travel Days for row {}".format(row.idx))
		if not self.is_new():
			if self.city_type:
				city_values = frappe.db.get_value(f"{self.city_type}", {"grade": self.grade},
												["lodging_allowance", "daily_allowance", "daily_allowance_gh"])

				lodging_allowance = city_values[0]
				daily_allowance = city_values[1]
				daily_allowance_gh = city_values[2]

			if self.stay_type == 'Hotel':
				allowance_limit = daily_allowance
			else:
				allowance_limit = daily_allowance_gh

			for row in self.advance_request_details:
				allowance_limit = int(allowance_limit)
				if row.allowance_type == 'Lodging Allowance':
					max_lodging = row.days * lodging_allowance
					if row.amount_per_day > lodging_allowance:
						frappe.throw("Lodging Allowance Amount More Than The Allotted Limit. Check Employee Policies.")
				else:
					max_daily = row.days * allowance_limit
					if row.amount_per_day > allowance_limit:
						frappe.throw("Daily Allowance Amount More Than The Allotted Limit. Check Employee Policies.")

			self.maximum_advance = max_daily + max_lodging
			days = row.days
		
		return max_lodging ,max_daily, days


	def before_save(self):
		if not self.is_new():
			total_amount = 0
			total_issued = 0
			for row in self.advance_request_details:

				row.total_amount  = row.amount_per_day * row.days
				total_amount += row.total_amount

			self.advance_requested = total_amount
			
			for row in self.advance_issued_details:
				total_issued += row.advance_issued

			# for row in self.advance_issued_details:
			# 	if(row.date):
			# 		if not (self.from_date <= str(row.date) <= self.to_data):
						
			# 			throw(_(f"Invalid date,The date {row.date} is not within the specified range."), title="Invalid Date")

			self.advance_issued = total_issued

			if total_issued > self.advance_requested:
				throw(_("Cannot Issue Advance More than Requested Advance"), title="Advance Limit Exceeded")

		if(self.is_new()):
			date1 = datetime.strptime(self.from_date, "%Y-%m-%d")  # Convert the date string to a datetime object
			date2 = datetime.strptime(self.to_data, "%Y-%m-%d")  # Convert the date string to a datetime object

			difference = date2 - date1  # Calculate the difference between the two dates
			days = int(difference.days)  # Extract the number of days from the difference
			self.travel_days = days

			
		# list_advance = frappe.db.get_list('Advance Request EXP', {'travel_request_id': self.travel_request_id}, ['name'])	
	# def after_save(self):
	# 	if (self.workflow_state == 'Sent For Approval'):
	# 		link = '192.168.10.21:8000'
	# 		email_subject = f"Advance Request Approval"
	# 		email_body = f"Dear , you have an advance request for approval at {link}."
			
	# 		frappe.sendmail(
	# 			# recipients=employee_emails,
	# 			recipients=['pvashista@expediens.com'],
	# 			subject=email_subject,
	# 			message=email_body,
				
	# 			now=True
	# 		)
	# 		frappe.msgprint("Advance Request Sent for approval")

			

	def before_insert(self):
			if self.is_new():
				fields = ["Lodging Allowance","Daily Allowance"]
				print(fields)
				for field in fields:
					child_doc = self.append("advance_request_details", {})
					child_doc.allowance_type = field

@frappe.whitelist()
def get_max_values(docname):
	doc = frappe.get_doc('Advance Request EXP', docname)
	max_lodging, max_daily,days = doc.validate()
	return {
		"max_lodging": max_lodging,
		"max_daily": max_daily,
		"days":days
	}





@frappe.whitelist()
def get_employee_details():
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("Employee EXP",{"Email ID":email_id},["name","grade"])
    return data


@frappe.whitelist()
def get_advance_list(docname):
    doc = frappe.get_doc('Advance Request EXP', docname) 
    list_advance = frappe.db.get_list('Advance Request EXP',
                                      filters={
                                          'travel_request_id': doc.travel_request_id,
                                          'employee_id': doc.employee_id
                                      },
                                      fields=['name'],
                                      as_list=True
                                     )

    if not doc.is_new():
        advance_issued_list = get_advance_issues(list_advance)
        html_table = update_advance_paid_details_table(doc, advance_issued_list)
    
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


def update_advance_paid_details_table(doc, advance_issued_list):
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
def get_list_context(docnames=None):
    email_id = frappe.session.data.get('user')
    data = frappe.get_value("Employee EXP",{"email_id":email_id},["name"])
    frappe.db.set_value("Advance Request EXP", docnames, "employee_id", data )
    frappe.publish_realtime("form_refresh", docnames, after_commit=True)
    	
    
    return data







# def get_advance_issues(list_advance):
# 	query = """
#         SELECT date, advance_issued
#         FROM `tabAvance Issued Details EXP`
#         WHERE parent IN %(parent_values)s
#     """
# 	parent_values = list_advance
# 	advance_issued_list = frappe.db.sql(query, {"parent_values": parent_values}, as_dict=True)
# 	for detail in advance_issued_list:
# 		frappe.msgprint(detail)
	# def before_save(self):
	# 	total_amount = 0
	# 	for row in self.advance_request_details:
	# 		total_amount += row.total_amount
	# 	frappe.msgprint("Total Requested Amount: {}".format(total_amount))
	# 	self.advance_requested = total_amount
    

# def validate(doc):
		# 	for row in doc.advance_request_details:
		# 		if row.days > 7:
		# 			frappe.throw("Days cannot be more than 7 for row {}".format(row.idx))

		 


		# def before_save(doc):
		# 	total_amount = 0
		# 	for row in doc.advance_request_details:
		# 		total_amount += row.total_amount
		# 	frappe.msgprint("Total Amount: {}".format(total_amount))
		# 	doc.advance_requested = total_amount


			# def validate(self):

	# 	lodging_allowance=0
	# 	daily_allowance = 0
	# 	daily_allowance_gh = 0 

	# 	if not self.is_new():
	# 		for row in self.advance_request_details:
	# 			if row.days > 7:
	# 				frappe.throw("Days cannot be more than 7 for row {}".format(row.idx))

	# 		if self.city_type:
	# 			lodging_allowance = frappe.db.get_value(f"{self.city_type}",{"grade":self.grade},"lodging_allowance")
				

	# 			if self.stay_type == "Hotel":
	# 				daliy_allowance = frappe.db.get_value(f"{self.city_type}",{"grade":self.grade},"daily_allowance")
					

	# 			elif self.stay_type == "Guest House":
	# 				daily_allowance_gh = frappe.db.get_value(f"{self.city_type}",{"grade":self.grade},"daily_allowance_gh")
					
			
	# 	# frappe.msgprint(f"{lodging_allowance}")
	# 	# frappe.msgprint(f"{daliy_allowance}")
	# 	# frappe.msgprint(f"{daily_allowance_gh}")
	# 	if self.stay_type == 'Hotel':
	# 		for row in self.advance_request_details:
	# 			if row.allowance_type == 'Lodging Allowance':
	# 				if row.amount_per_day > lodging_allowance:
	# 					frappe.throw("Lodging Allowance Amount More Than The Alloted Limit Check Employee Policies")
	# 			else:
	# 				if row.amount_per_day > daily_allowance:
	# 					frappe.throw("Daily Allowance Amount More Than The Alloted Limit Check Employee Policies")
			
			

	# 	else:
	# 		for row in self.advance_request_details:
	# 			if row.allowance_type == 'Lodging Allowance':
	# 				if row.amount_per_day > lodging_allowance:
	# 					frappe.throw("Lodging Allowance Amount More Than The Alloted Limit Check Employee Policies")
	# 			else:
	# 				if row.amount_per_day > daily_allowance_gh:
	# 					frappe.throw("Daily Allowance Amount More Than The Alloted Limit Check Employee Policies")
			
			
				