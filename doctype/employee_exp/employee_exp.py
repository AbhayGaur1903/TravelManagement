# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from datetime import date


class EmployeeEXP(Document):
    def before_insert(self):
        self.auto_id = f"{self.employee_id}/{self.first_name}"
        employee_fname = self.first_name
        employee_lname = self.last_name
        employee_mobile = self.mobile_no
        employee_email = self.email_id
        employee_isManager = self.is_manager
        if self.email_id:
            make_user(employee_fname,employee_lname,employee_mobile,employee_email,employee_isManager)

    def validate(self):
        if self.date_of_birth:
            self.age = calculate_age(self.date_of_birth)


@frappe.whitelist()
def calculate_age(date_of_birth):
    birth_date = frappe.utils.getdate(date_of_birth)
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return age
      
        
     
def update_user(doc_user):
        doc_user.save()
        frappe.db.set_value("User", doc_user.name, "user_type", "System User")
        frappe.msgprint("User Created")


def make_user(employee_fname, employee_lname, employee_mobile,employee_email,employee_isManager):
    # check if record already exists
    if frappe.db.exists("User", {"first_name": employee_fname, "email": employee_email}):
        frappe.throw("User already exists")

    doc_user= frappe.new_doc("User")
    doc_user.first_name = employee_fname
    doc_user.last_name = employee_lname
    doc_user.mobile_no = employee_mobile
    doc_user.email = employee_email
    doc_user.enabled = True
    doc_user.owner = "Administrator"
    doc_user.user_type = "System User"
    doc_user.new_password = "root@123"
    doc_user.role_profile_name = "Employee"
    doc_user.module_profile = "Travel Management"
    doc_user.send_welcome_email = 0
    
    doc_user.save()

    frappe.db.set_value("User", doc_user.name, "modified_by", "Administrator")
    frappe.db.set_value("User", doc_user.name, "owner", "Administrator")
    frappe.db.set_value("User", doc_user.name, "user_type", "System User")
    if(employee_isManager == 1):
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Manager")
    else:   
        frappe.db.set_value("User", doc_user.name, "role_profile_name", "Employee")
    
    doc_user.reload()
    update_user(doc_user)

    