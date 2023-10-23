// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt


frappe.ui.form.on('Advance Request EXP', {
	refresh:function(frm){
		if(frm.is_new()){

		frm.set_intro('Please Fill in the Form Fields and save the document. Use the Action Button to send the form for approval', 'blue');
		
		}
	}

});

frappe.ui.form.on('Advance Request EXP', {
	refresh:function(frm){
		if (frm.is_new()) {
			frm.set_df_property('advance_request_detail_section', 'hidden', 1);
			frm.set_df_property('advances_issued_section', 'hidden', 1);
			
			frm.set_df_property('section_break_rxjtm', 'hidden', 0);
			frm.set_df_property('travel_category', 'read_only', 1);
			frm.set_df_property('travel_request_id', 'read_only', 1);
			frm.set_df_property('from_date', 'read_only', 1);
			frm.set_df_property('to_data', 'read_only', 1);
			frm.set_df_property('employee_id', 'read_only', 1);
			frm.set_df_property('approver', 'read_only', 1);
			frm.set_df_property('client', 'read_only', 1);
			frm.set_df_property('grade', 'read_only', 1);
			frm.set_df_property('advance_issued_details','read_only',1);
			

			 // Show the extended field
        }
		else {
			frm.set_df_property('advance_request_detail_section', 'hidden', 0);
			frm.set_df_property('section_break_rxjtm', 'hidden', 0);
			frm.set_df_property('advances_issued_section', 'hidden', 0);
			

		}
	}

});


frappe.ui.form.on('Advance Request EXP', {
	refresh:function(frm){
		if (frm.doc.workflow_state == 'Draft') {
			frm.set_df_property('travel_category', 'read_only', 1);
			frm.set_df_property('travel_request_id', 'read_only', 1);
			frm.set_df_property('from_date', 'read_only', 1);
			frm.set_df_property('to_data', 'read_only', 1);
			frm.set_df_property('employee_id', 'read_only', 1);
			frm.set_df_property('approver', 'read_only', 1);
			frm.set_df_property('client', 'read_only', 1);
			frm.set_df_property('grade', 'read_only', 1);
			frm.set_df_property('advance_requested', 'read_only', 1);
			frm.set_df_property('advance_issued', 'read_only', 1);
			frm.set_df_property('maximum_advance', 'read_only', 1);
			frm.set_df_property('advance_issued_details','read_only',1);
			
        }
		
	}

});

// frappe.ui.form.on('Avance Issued Details EXP', {
// 	date: function(frm, cdt, cdn) {
// 		validateDate(frm, cdt, cdn);
// 	}
// });

// function validateDate(frm, cdt, cdn) {
// 	var childTable = locals[cdt][cdn];
// 	var from_date = frm.doc.from_date;
// 	var to_date = frm.doc.to_data;
// 	var travel_date = childTable.date;

// 	if (travel_date < from_date || travel_date > to_date) {
// 		childTable.date = ""; // Clear the travel_date field
// 		frappe.throw("Date should be between From Date and To Date for row " + childTable.idx);
// 	}
// }



frappe.ui.form.on('Advance Request Details EXP', {
	
    days: function(frm, cdt, cdn) {

        validateDays(frm, cdt, cdn);
        calculateTotalAmount(frm, cdt, cdn);
    },
    amount_per_day: function(frm, cdt, cdn) {
        calculateTotalAmount(frm, cdt, cdn);
    }
});

function validateDays(frm, cdt, cdn) {
    let childTable = locals[cdt][cdn];
    if (childTable.days > 7) {
        frappe.throw('Days cannot be more than 7');
    }
}

function calculateTotalAmount(frm, cdt, cdn) {
    let childTable = locals[cdt][cdn];
    childTable.total_amount = childTable.days * childTable.amount_per_day;
    frm.refresh_field('advance_request_details');
}



frappe.ui.form.on('Advance Request EXP', {
    refresh: function(frm) {
        // Check if the current user has the "Finance Head" role
        if (frappe.user.has_role('Finance Head')) {
            // Show the maximum_advance field
			frm.set_df_property('advance_logic', 'hidden', false);
            frm.set_df_property('maximum_advance', 'hidden', false);
            frm.refresh_field('maximum_advance');
			frm.refresh_field('advance_logic');

        } else {
            // Hide the maximum_advance field
            frm.set_df_property('maximum_advance', 'hidden', true);
			frm.set_df_property('advance_logic', 'hidden', true);
            frm.refresh_field('maximum_advance');
			frm.refresh_field('advance_logic');
        }
    }
});

// 


frappe.ui.form.on('Advance Request EXP', {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frappe.call({
                method: 'frappe.travel_management_app.doctype.advance_request_exp.advance_request_exp.get_advance_list',
                args: {
                    docname: frm.doc.name
                },
                callback: function(response) {
                    if (response && response.message) {
                        frm.fields_dict.advance_paid_details_table.df.options = response.message;
                        frm.refresh_field('advance_paid_details_table');
                    }
                }
            });
        }
    }
});

frappe.ui.form.on('Advance Request EXP', {
    refresh: function(frm) {
        if (frm.doc.travel_extension_checker == 1) {
            frm.set_intro('Please Note that this Advance Request is created against an Extended Travel Request', 'red');
            frm.fields_dict.travel_request_id.$input.css('color', 'red');
        }
    }
});

frappe.ui.form.on('Advance Request EXP', {
    refresh: function(frm) {
		frm.save();
    }
});

  



frappe.ui.form.on('Advance Request EXP', {
    advance_logic: function(frm) {
		frappe.call({
			method: 'frappe.travel_management_app.doctype.advance_request_exp.advance_request_exp.get_max_values',
			args: {
				docname: frm.doc.name
			},
			callback: function(response) {
				var max_lodging = response.message.max_lodging;
				var max_daily = response.message.max_daily;
				var days = response.message.days;
				var lodging = max_lodging / days;
				var daily = max_daily / days;
				frappe.msgprint('Max Lodging: ' + max_lodging + '<br>Max Daily: ' + max_daily + '<br>Lodging: ' + lodging + '<br>Daily: ' + daily + '<br>Days: ' + days + '<br>City: ' + frm.doc.city_type);
			}
		});
            
        
    }
});


// frappe.ui.form.on('Advance Request EXP', {
	//     refresh: function(frm) {
	// 		if (!frm.doc.employee_id && !frm.is_new()) {
	// 			frappe.call({
	// 				method: 'frappe.travel_management_app.doctype.advance_request_exp.advance_request_exp.get_list_context',
	// 				args: {
	// 					docnames: frm.doc.name
	// 				},
	// 				callback: function(response) {
	// 					frm.reload_doc();
	// 				}
	//             });
				
	//         }
	//     }
	// });


// frappe.ui.form.on('Advance Request EXP', {
//     refresh: function(frm) {
// 		if (!frm.doc.employee_id) {
// 			setTimeout(function() {
// 				frappe.call({
//                     method: 'frappe.travel_management_app.doctype.advance_request_exp.advance_request_exp.get_list_context',
//                     args: {
//                         docnames: frm.doc.name
//                     },
//                     callback: function(response) {
//                         frm.reload_doc();
//                     }
//                 });
//             }, 5000); // 5 seconds delay
//         }
//     }
// });




// frappe.ui.form.on('Advance Request Details EXP', {
//     days: function(frm, cdt, cdn) {
//         validateDays(frm, cdt, cdn);
//         calculateTotalAmount(frm);
//     },
//     amount_per_day: function(frm, cdt, cdn) {
//         calculateTotalAmount(frm);
//     },
//     total_amount: function(frm, cdt, cdn) {
//         calculateTotalAmount(frm);
//     }
// });

// function validateDays(frm, cdt, cdn) {
//     let childTable = locals[cdt][cdn];
//     if (childTable.days > 7) {
//         frappe.throw('Days cannot be more than 7');
//     }
// }

// function calculateTotalAmount(frm) {
//     let totalAmount = 0;
//     frm.doc.advance_request_details.forEach(function(detail) {
//         totalAmount += detail.total_amount || 0;
//     });
//     frm.set_value('advance_requested', totalAmount);
// }



// frappe.ui.form.on('Advance Request EXP', {
// 	validate: function(frm) {
// 		if

// 	}
// });

// frappe.ui.form.on('Advance Request EXP', {
//     refresh: function(frm) {
//         // Check if the current user has the "Finance Head" role
//         frappe.call({
//             method: "frappe.get_roles",
//             callback: function(response) {
//                 var roles = response.message;
// 				frappe.msgprint(`${roles}`);

//                 if (roles.includes('Finance Head')) {
//                     // Show the maximum_advance field
//                     frm.set_df_property('maximum_advance', 'hidden', false);
//                     frm.refresh_field('maximum_advance');
//                 } else {
//                     // Hide the maximum_advance field
//                     frm.set_df_property('maximum_advance', 'hidden', true);
//                     frm.refresh_field('maximum_advance');
//                 }
//             }
//         });
//     }
// });
