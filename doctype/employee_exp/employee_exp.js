// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Employee EXP', {
	// refresh: function(frm) {

	// }
});

frappe.ui.form.on('Employee EXP', {
    date_of_birth: function(frm) {
        if (frm.doc.date_of_birth) {
            frappe.call({
                method: 'frappe.travel_management_app.doctype.employee_exp.employee_exp.calculate_age',
                args: {
                    date_of_birth: frm.doc.date_of_birth
                },
                callback: function(response) {
					var age = response.message
                    frm.set_value('age', age);
					
					// console.log(`${age}`)
                    frm.refresh_field('age');
                }
            });
        }
    }
});