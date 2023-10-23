# from frappe import _ 

# @frappe.whitelist()
# def get_list_context(context):
#     email_id = frappe.session.data.get('user')
#     data = frappe.get_value("Employee EXP",{"email_id":email_id},["auto_id"])
# 	frappe.msgprint(f"testing")
#     filters({
# 		'approver': data
# 	})
# 	context.update ({
# 		'title': _("Travel List Allocated to me"),
# 		'no_breadcrumbs':True,
# 		'filters':filters
# 	})


