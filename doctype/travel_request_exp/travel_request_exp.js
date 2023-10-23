frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		if (
			!frm.is_new() &&
			(frm.doc.workflow_state === "Booking Confirmed" ||
				frm.doc.workflow_state === "Approved")
		) {

			frm.add_custom_button("Create Advance Request", () => {
				
				doc = frappe.new_doc("Advance Request EXP", {
					travel_category: frm.doc.travel_category,
					travel_request_id: frm.doc.name,
					from_date: frm.doc.from_data,
					to_data: frm.doc.to_date,
					approver: frm.doc.approver,
					employee_id: frm.doc.employee_id,
					grade: frm.doc.grade,
					client: frm.doc.client,
					city_type: frm.doc.city_type,
					stay_type: frm.doc.stay_type,
					travel_extension_checker : frm.doc.travel_extension_checker,
					
				});
			});
		}
	}
});

// frappe.ui.form.on("Travel Request EXP", {
// 	refresh: function(frm) {
// 		if (
// 			!frm.is_new() &&
// 			(frm.doc.workflow_state === "Booking Confirmed" ||
// 				frm.doc.workflow_state === "Approved")
// 		) {

// 			frm.add_custom_button("Create Expense Claim", () => {
				
// 				doc = frappe.new_doc("Expense Claim EXP", {
// 					// travel_category: frm.doc.travel_category,
// 					travel_request_id: frm.doc.name,
// 					from_date: frm.doc.from_data,
// 					to_date: frm.doc.to_date,
// 					approver: frm.doc.approver,
// 					purpose:frm.doc.visit_type,
// 					employee_id:frm.doc.employee_id,
// 					city:frm.doc.city,
// 					client:frm.doc.client,
// 					period_of_stay:frm.doc.travel_days,
// 					grade: frm.doc.grade,
// 					travel_extension_checker : frm.doc.travel_extension_checker

// 					// approver: frm.doc.approver,
// 					// grade: frm.doc.grade,
// 					// client: frm.doc.client,
// 					// city_type: frm.doc.city_type,
// 					// stay_type: frm.doc.stay_type,
// 					// travel_extension_checker : frm.doc.travel_extension_checker,
					
// 				});
// 			});
// 		}
// 	}
// });

frappe.ui.form.on("Travel Request EXP", {
    refresh: function(frm) {
        if (
            !frm.is_new() &&
            (frm.doc.workflow_state === "Booking Confirmed" ||
                frm.doc.workflow_state === "Approved")
        ) {
            frappe.call({
                method: "frappe.travel_management_app.doctype.expense_claim_exp.expense_claim_exp.check_existing_expense_claim",
                args: {
                    travel_request_id: frm.doc.name,
                    employee_id: frm.doc.employee_id
                },
                callback: function(response) {
                    var hasExpenseClaim = response.message;

                    if (!hasExpenseClaim) {
                        frm.add_custom_button("Create Expense Claim", () => {
                            // Your button code here
                            doc = frappe.new_doc("Expense Claim EXP", {
								// travel_category: frm.doc.travel_category,
								travel_request_id: frm.doc.name,
								from_date: frm.doc.from_data,
								to_date: frm.doc.to_date,
								approver: frm.doc.approver,
								purpose:frm.doc.visit_type,
								employee_id:frm.doc.employee_id,
								city:frm.doc.city,
								client:frm.doc.client,
								period_of_stay:frm.doc.travel_days,
								grade: frm.doc.grade,
								travel_extension_checker : frm.doc.travel_extension_checker
			
								// approver: frm.doc.approver,
								// grade: frm.doc.grade,
								// client: frm.doc.client,
								// city_type: frm.doc.city_type,
								// stay_type: frm.doc.stay_type,
								// travel_extension_checker : frm.doc.travel_extension_checker,
								
							});
                        });
                    }
                }
            });
        }
    }
});


frappe.ui.form.on("Travel Request EXP", {
	travel_type: function(frm) {
		if (frm.doc.travel_type == "Local") {
			frm.set_query("mode", "travel_details", () => {
				return {
					filters: {
						travel_type: "Local"
					}
				};
			});
		} else {
			frm.set_query("mode", "travel_details", () => {
				return {
					filters: {
						travel_type: "Outstation"
					}
				};
			});
		}
		frm.refresh_field("travel_details");
	}
});

frappe.ui.form.on("Travel Request EXP", {
	travel_type: function(frm) {
		if (frm.doc.travel_type == "Local") {
			frm.set_query("mode", "travel_details_return", () => {
				return {
					filters: {
						travel_type: "Local"
					}
				};
			});
		} else {
			frm.set_query("mode", "travel_details_return", () => {
				return {
					filters: {
						travel_type: "Outstation"
					}
				};
			});
		}
		frm.refresh_field("travel_details_return");
	}
});

frappe.ui.form.on("Travel Request EXP", {
	visit_type: function(frm) {
		if (frm.doc.visit_type == "Technical") {
			frm.set_query("approver", () => {
				return {
					filters: {
						department: "Technical",
						is_manager: 1
					}
				};
			});
		} 
		else if(frm.doc.visit_type == "Sales/ Marketing"){
			frm.set_query("approver", () => {
				return {
					filters: {
						department: "Sales/Marketing",
						is_manager: 1
					}
				};
			});
		}
		else{
			frm.set_query("approver", () => {
				return {
					filters: {
						department: "BackOffice",
						is_manager: 1
					}
				};
			});
		}
		frm.refresh_field("approver");
	}
});

frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		if (frm.doc.workflow_state == "Trip Extension" ) {
			frm.fields.forEach(function(field) {
				frm.set_df_property(field.df.fieldname, "read_only", 1);
			});
			frm.set_df_property("travel_extension_section", "hidden", 0);
			frm.set_df_property("travel_extension_details", "read_only", 1);
			frm.set_df_property("travel_extension_details", "reqd", 1);
			frm.set_value('travel_extension_checker', 1)

		
	}
}
});
frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		if (frm.doc.workflow_state == "Sent For Trip Extension Approval" ) {
			
			frm.set_df_property("travel_extension_section", "hidden", 0);
			frm.set_df_property("travel_extension_details", "read_only", 1);
			
			frm.set_value('travel_extension_checker', 1)

		
	}
}
});


frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		
		if (frm.doc.workflow_state == "Return Travel") {
			frm.fields.forEach(function(field) {
				frm.set_df_property(field.df.fieldname, "read_only", 1);
				
			});
			frm.set_df_property("travel_details_return", "read_only", 0);
			frm.set_df_property("travel_details_return", "reqd", 1);
			
			frm.set_intro('Press CTRL + F5 to view field if unable to see Travel Details Return', 'blue');
			

		}
		
	}
});
frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		if (frm.is_new()) {
			frm.set_df_property("comments_section", "hidden", 1);
			frm.set_df_property("booking_status_section", "hidden", 1);
			// frm.set_df_property("travel_details_section", "hidden", 1);
			// frm.set_df_property("approver", "hidden", 1);
			frm.set_df_property("approver", "reqd", 1);
			frm.set_df_property("travel_extension_section", "hidden", 1);
			frm.set_df_property("stay_type", "reqd", 1);
			
			
			

			// frm.set_df_property("section_break_coz2p", "hidden", 1);
		} else {
			frm.set_df_property("comments_section", "hidden", 0);
			frm.set_df_property("booking_status_section", "hidden", 0);
			frm.set_df_property("travel_details_section", "hidden", 0);
			frm.set_df_property("section_break_coz2p", "hidden", 0);
			frm.set_df_property("approver", "hidden", 0);
			frm.set_df_property("grade", "read_only", 1);
			frm.set_df_property("employee_id", "read_only", 1);
			frm.set_df_property("travel_category", "read_only", 1);
		}
	}
});
frappe.ui.form.on("Travel Request EXP", {
	refresh: function(frm) {
		if (frm.doc.workflow_state == 'Draft') {
			frm.set_df_property("comments_section", "hidden", 1);
			frm.set_df_property("booking_status_section", "hidden", 1);
			frm.set_df_property("approver", "reqd", 1);
			frm.set_df_property("stay_type", "reqd", 1);
			frm.set_df_property("travel_extension_section", "hidden", 1);

		} else {
			frm.set_df_property("comments_section", "hidden", 0);
			frm.set_df_property("booking_status_section", "hidden", 0);
			
			
		}
	}
});

frappe.ui.form.on('Travel Request EXP', {
    refresh: function(frm) {
        if (frm.doc.workflow_state === 'Sent To Travel Desk' && frappe.user.has_role('Travel Desk')) {
            frm.set_df_property("booking_detals", "reqd", 1);
			frm.set_intro('Please enter the booking details in the BOOKING DETAILS Table ', 'red');
            
            if (!frm.__is_saved) {
                frm.dirty();
				
            }
        }
    },
    validate: function(frm) {
        frm.__is_saved = true;
    }
});



frappe.ui.form.on("Travel Request EXP", {
	if_city_not_in_dropdown_press_this: function(frm) {
		if (frm.doc.if_city_not_in_dropdown_press_this) {
			frm.set_value("city", "");
		}
		else{
			frm.set_value("city_other","");
		}
	}
});


// VALIDATE DATE IN TRAVEL BOOKING
// frappe.ui.form.on("Travel Request Details EXP", {
// 	travel_date: function(frm, cdt, cdn) {
// 		validateDate(frm, cdt, cdn);
// 	}
// });

// function validateDate(frm, cdt, cdn) {
// 	var childTable = locals[cdt][cdn];
// 	var from_date = frm.doc.from_data;
// 	var to_date = frm.doc.to_date;
// 	var travel_date = childTable.travel_date;
// 	if (travel_date < from_date || travel_date > to_date) {
// 		childTable.travel_date = ""; // Clear the travel_date field
// 		frappe.throw(
// 			"Travel Date should be between From Date and To Date for row " + childTable.idx
// 		);
// 		refresh_field("travel_date", cdt, cdn);
// 	}
// }

frappe.ui.form.on("Travel Request EXP", {
	travel_category: function(frm) {
		if (frm.is_new()) {
			
			frm.set_df_property("employee_id", "read_only", 1);
			frm.set_df_property("grade", "read_only", 1);

			frappe.call({
				method:
					"frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.get_employee_details",
				callback: function(response) {
					var data = response.message;
					if (frm.doc.travel_category) {
						
						frm.set_value("employee_id", data[0]);
						frm.refresh_field("employee_id");
						frm.set_value("grade", data[1]);
						frm.set_value('employees_id_group','');
					}
					// else {
					// 	frm.set_value("employee_id",'');
					// 	let row = frm.add_child("employees_id_group", {
					// 		employees: data[0]
					// 	});
					// 	frm.refresh_field("employees_id_group");
						

					// 	frm.set_value("grade", data[1]);
					// 	frm.refresh_field("grade");
					// }
				}
			});
		}
	}
});

//trip extension popup
frappe.ui.form.on('Travel Request EXP', {
	refresh: function(frm) {
	  if (frm.doc.workflow_state === 'Trip Extension') {
		frm.add_custom_button('Add Extension', function() {
		  var fields = [
			{ 'fieldname': 'from_date', 'fieldtype': 'Date', 'label': 'From Date', 'reqd': 1, 'default': frappe.datetime.add_days(frm.doc.to_date, 1),'read_only':1 },
			{ 'fieldname': 'to_date', 'fieldtype': 'Date', 'label': 'To Date', 'reqd': 1 },
			{ 'fieldname': 'reason', 'fieldtype': 'Text', 'label': 'Reason', 'reqd': 1 }
		  ];
  
		  frappe.prompt(fields, function(values) {
			if (frappe.datetime.str_to_obj(values.from_date) > frappe.datetime.str_to_obj(values.to_date)) {
			  frappe.throw('To Date cannot be before the From Date.');
			  return;
			}
			
			if (frappe.datetime.str_to_obj(values.from_date) < frappe.datetime.str_to_obj(frm.doc.to_date)) {
			  frappe.throw('From Date cannot be before the existing To Date.');
			  return;
			}
			
			// Check for duplicate values
			var duplicateExists = frm.doc.travel_extension_details.some(function(row) {
				return row.from_date === values.from_date || row.to_date === values.to_date && row.reason === values.reason;
			  });
			if (duplicateExists) {
			frappe.throw('Extension with the same details already exists.');
			return;
			}

			// Check if from_date is before the to_date in the last row of the child table
			var lastRow = frm.doc.travel_extension_details[frm.doc.travel_extension_details.length - 1];
			if (lastRow && frappe.datetime.str_to_obj(values.from_date) < frappe.datetime.str_to_obj(lastRow.to_date)) {
			frappe.throw('From Date cannot be before the existing To Date in the last row.');
			return;
			}
			var row = frappe.model.add_child(frm.doc, 'Travel Request Extension', 'travel_extension_details');
			row.from_date = values.from_date;
			row.to_date = values.to_date;
			row.reason = values.reason;
  
			frm.refresh_field('travel_extension_details');
		  }, 'Add Extension');
		});
	  }
	}
  });
  
  

//ticket sending button
frappe.ui.form.on("Booking Status EXP", {
	send: function(frm, cdt, cdn) {
		var child = locals[cdt][cdn];
		var parent_docname = frm.doc.name;
		var row_id = child.idx;
		if(!child.ticket){
			frappe.throw("Attach Ticket")
		}
		 // Assuming the child table has an 'idx' field
		
		// var progress = 0;
		// var progressInterval = setInterval(function() {
		// 	progress += 10;
		// 	frappe.show_progress(__('Sending Tickets'), progress);

		// 	if (progress >= 100) {
		// 		clearInterval(progressInterval);
		// 		frappe.hide_progress();
		// 	}
		// }, 1000);

		frappe.call({
			method: "frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.send_ticket",
			args: {
				docname: parent_docname,
				row_id: row_id
			},
			callback: function(response) {
				// Handle the response callback logic here

				// Example: Show a success message
				frappe.msgprint("Ticket sent successfully.");

				// Hide the progress popup
				frappe.hide_progress();
			}
		});
	}
});


frappe.ui.form.on("Hotel Details EXP", {
    send: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        var parent_docname = frm.doc.name;
        var row_id = child.idx;
        if (!child.hotel_ticket) {
            frappe.throw("Attach Ticket");
        }

        frappe.call({
            method: "frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.send_hotel_ticket",
            args: {
                docname: parent_docname,
                row_id: row_id
            },
            callback: function(response) {
                // Handle the response callback logic here

                // Example: Show a success message
                frappe.msgprint("Ticket sent successfully.");

                // Hide the progress popup
                frappe.hide_progress();
            }
        });
    }
});



// code for Number_of_days field in Hotel Details EXP

frappe.ui.form.on("Hotel Details EXP", {
    check_in: function(frm, cdt, cdn) {
        calculateNoOfDays(frm, cdt, cdn);
    },
    check_out: function(frm, cdt, cdn) {
        calculateNoOfDays(frm, cdt, cdn);
    }
});

function calculateNoOfDays(frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    var check_in = child.check_in;
    var check_out = child.check_out;

    // console.log("Check-in:", check_in);
    // console.log("Check-out:", check_out);

    if (check_in && check_out) {
        var time_diff = new Date(check_out) - new Date(check_in);
        var no_of_days = Math.ceil(time_diff / (1000 * 60 * 60 * 24)); 
        console.log("Number of days:", no_of_days);

        // child.number_of_days = no_of_days;
        frm.refresh_field("hotel_details_exp");
    }
}

frappe.ui.form.on('Travel Request EXP', {
    refresh: function(frm) {

		frappe.dom.set_style(`
			.layout-main .layout-side-section {
				display:none;
			}
		
		`);
		// frappe.ui.toolbar.toggle_full_width();
		
	}
	
});

frappe.ui.form.on('Travel Request EXP', {
    booking_vouchers: function(frm) {
		frappe.call({
            method: "frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.get_attached_files",
            args: {
                docname: frm.doc.name
                
            },
            callback: function(response) {
				frappe.msgprint(response.message);

                
            }
        });

		
	}
	
});





// frappe.ui.form.on('Travel Request EXP', {
// 	before_submit: function(frm) {
//         frappe.prompt([
//                 {
//                     fieldname: 'reject_reason',
//                     label: 'Reason for rejection',
//                     fieldtype: 'Data',
//                     reqd: 1
//                 }
//             ],function(values) {
// 				        if (values.comments) {
// 				            // Perform the workflow update logic here
// 				            // e.g., update the workflow state to "Rejected" and save the form
// 				            frm.doc.approver_comments = values.comments;
// 				            frm.save();

// 				            // Show a success message
// 				            frappe.show_alert('Travel request rejected successfully.');

// 				            // Refresh the form to reflect the updated state
// 				            frm.refresh();

// 				    }
//             }, 'Rejection Reason');

//             // Return false to prevent saving the document until the reason is entered
//             return false;

//     }
// });

// frappe.ready(() => {
//     const list_view = frappe.views.get_active_view();

//     if (list_view.doctype === 'Travel Request EXP') {
//         // Create an instance of ListFilter
//         const list_filter = new frappe.ui.ListFilter({
//             wrapper: $('.list-filters'),
//             doctype: list_view.doctype,
//             list_view: list_view
//         });

//         // Modify the list view query to filter documents where the 'approver' field is set to 'EXEMP-0034/Anand'
//         list_view.page.fields_dict["approver"].get_query = function() {
//             return {
//                 filters: {
//                     approver: 'EXEMP-0034'
//                 }
//             };
//         };

//         // Refresh the list view to apply the filter
//         list_view.refresh();
//     }
// });

// frappe.ui.form.on('Travel Request EXP', {
//     validate: function(frm) {

//         var from_date = frm.doc.from_data;
//         var to_date = frm.doc.to_date;

//         frm.doc.travel_details.forEach(function(detail) {
//             var travel_date = detail.travel_date;

//             if (travel_date < from_date || travel_date > to_date) {
//                 frappe.throw('Travel Date should be between From Date and To Date for row ' + detail.idx);
//             }
//         });
//     }
// });

// frappe.ui.form.on('Travel Request EXP', {
//     refresh: function(frm) {
//         if (frm.doc.workflow_state === 'Sent for Approval') {
//             frm.add_custom_button('Add Rejection Comment', function() {
//                 showCommentsPopup(frm);
//             });
//         }
//     }
// });

// function showCommentsPopup(frm) {
//     frappe.prompt([
//         {
//             fieldname: 'comments',
//             label: 'Comments',
//             fieldtype: 'Text',
//             reqd: 1
//         }
//     ],
//     function(values) {
//         if (values.comments) {
//             // Perform the workflow update logic here
//             // e.g., update the workflow state to "Rejected" and save the form
//             frm.doc.workflow_state = 'Rejected';
//             frm.doc.approver_comments = values.comments;
//             frm.save();

//             // Show a success message
//             frappe.show_alert('Travel request rejected successfully.');

//             // Refresh the form to reflect the updated state
//             frm.refresh();

//         }
//     },
//     'Reject Travel Request',
//     'Reject'
//     );
// }

// frappe.ui.form.on('Travel Request EXP', {
//     refresh: function(frm) {
// 		if (frm.doc.workflow_state == 'Sent To Travel Desk' ) {
// 			// frm.fields.forEach(function(field) {
// 			// 	frm.set_df_property(field.df.fieldname, 'read_only', 1);
// 			// })

// 			// frm.set_df_property(frm.doc.booking_status_section, 'read_only', 0);
// 			// frm.refresh_field('booking_status_section')

// 			// frm.set_df_property(frm.doc.travel_booking_status, 'read_only', 0);
// 			// frm.refresh_field('travel_booking_status')
// 			frm.set_df_property(frm.doc.travel_booking_status, 'mandatory', 1);

//     }}
// });

// frappe.ui.form.on('Travel Request EXP', {
//     refresh: function(frm) {
//         frm.add_custom_button('View Session Data', function() {
//             frappe.call({
//                 method: 'frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.get_session_data',
//                 callback: function(response) {
//                     var session_data = response.message;
//                     frappe.msgprint('<pre>' + JSON.stringify(session_data, null, 2) + '</pre>');
//                 }
//             });
//         });
//     }
// });

// frappe.ui.form.on('Travel Request EXP', {
// 	refresh:function(frm){
// 		frm.add_custom_button(__('trigger whitelisted func'), function() {
// 			frappe.call({
// 				method : 'frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.add_shared_users',
// 				args : {
// 					doctype:'Travel Request EXP',
// 					docname:frm.doc.name

// 				}

// 			})

// 		})

// 	}
// });

// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

// frappe.ui.form.on('Travel Request EXP', {
// 	refresh:function(frm){
// 		if (!frm.is_new() && frm.)
// 		frm.add_custom_button(__('Create Advance Request'), function() {
// 			frappe.call({
// 				method : 'frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.add_shared_users',
// 				args : {
// 					doctype:'Travel Request EXP',
// 					docname:frm.doc.name

// 				}

// 			})

// 		})

// 	}
// });
// frappe.ui.form.on('', {
//     refresh: function(frm) {
//
// 			frm.add_custom_button(__(), function() {
// 				frappe.new_doc('', {

// 				})

// 			})

// 		}

//     }
// });



// //Clear  Button  Based  On  Booking Status
// frappe.ui.form.on('Travel Request EXP', {
//     refresh: function(frm) {
// 		if (frm.doc.travel_booking_status == 'Unable to Book (No Seats)' ||frm.doc.travel_booking_status == 'Booked / Waiting' ){
//         // Hide the actions button in the workflow section
//         frm.page.clear_actions_menu();
// 		}
//     }
// });

// frappe.ui.form.on("Travel Request EXP", {
//     refresh: function(frm) {
//         // Clear action menu when a new row is added to the "booking_details" table
//         clearActionMenu(frm);
//     },
//     booking_detals_remove: function(frm) {
//         // Clear action menu when a row is removed from the "booking_details" table
//         clearActionMenu(frm);
//     }
// });

// frappe.ui.form.on("Booking Status EXP", {
// 	booking_status: function(frm, cdt, cdn) {
// 		validateBookingStatus(frm, cdt, cdn);
// 	}
// });

// function validateBookingStatus(frm, cdt, cdn) {
// 	var childTable = locals[cdt][cdn];
// 	var booking_status = childTable.booking_status;
// 	if (booking_status == 'Unable to Book (No Seats)') {
// 		clear_actions_menu();
// 	}
// }

// frappe.ui.form.on("Booking Status EXP", {
//     booking_status: function(frm, cdt, cdn) {
//         // Get the parent form (Travel Request EXP)
//         var parent_frm = frm.parent;
		

//         var row = frappe.get_doc(cdt, cdn);
// 		frappe.msgprint(`${row.booking_status}`);
//         // Check if the selected value is "Unable to Book"
//         if (row.booking_status == "Unable to Book (No Seats)") {
//             clearActionMenu(parent_frm);
//         }
//     }
// });

// function clearActionMenu(frm) {
//     // Clear the action menu
//     frm.page.clear_actions_menu();
// }

// frappe.ui.form.on("Travel Request EXP", {
//     before_save: function(frm) {
// 		frappe.throw("hey");
//         // Check if any row in the "booking_details" table has "Unable to Book" selected
//         var unableToBookSelected = frm.doc.booking_detals.some(function(row) {
			
//             return row.booking_status === "Unable to Book (No Seats)";
//         });

//         if (unableToBookSelected) {
//             clearActionMenu(frm);
//         }
//     }
// });

// function clearActionMenu(frm) {
//     // Clear the action menu
//     frm.page.clear_actions_menu();
// }

// frappe.ui.form.on('Travel Request EXP', {
	// 	refresh: function(frm) {
	// 	  if (frm.doc.workflow_state === 'Trip Extension') {
	// 		frm.add_custom_button('Add Extension', function() {
	// 		  var fields = [
	// 			{ 'fieldname': 'from_date', 'fieldtype': 'Date', 'label': 'From Date', 'reqd': 1 },
	// 			{ 'fieldname': 'to_date', 'fieldtype': 'Date', 'label': 'To Date', 'reqd': 1 },
	// 			{ 'fieldname': 'reason', 'fieldtype': 'Text', 'label': 'Reason', 'reqd': 1 }
	// 		  ];
	  
	// 		  frappe.prompt(fields, function(values) {
	// 			var row = frappe.model.add_child(frm.doc, 'Travel Request Extension', 'travel_extension_details');
	// 			row.from_date = values.from_date;
	// 			row.to_date = values.to_date;
	// 			row.reason = values.reason;
	  
	// 			frm.refresh_field('travel_extension_details');
	// 		  }, 'Add Extension');
	// 		});
	// 	  }
	// 	}
	//   });