// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Expense Claim EXP', {
	refresh: function(frm) {
		if(frm.is_new()){
			frm.set_df_property("travel_request_id", "read_only", 1);
			frm.set_df_property("grade", "read_only", 1);

		}

	}
});
frappe.ui.form.on('Expense Claim EXP', {
	refresh: function(frm) {
		if(frm.doc.workflow_state == 'Draft'){
			frm.set_df_property("travel_request_id", "read_only", 1);
			frm.set_df_property("grade", "read_only", 1);

		}

	}
});

frappe.ui.form.on('Expense Claim EXP', {
	refresh: function(frm) {
		if(frm.is_new()){
            frm.save();
			

		}

	}
});




// frappe.ui.form.on('Expense Claim EXP', {
//     refresh: function(frm) {
// 		frappe.call({
// 			method: "frappe.travel_management_app.doctype.expense_claim_exp.expense_claim_exp.get_transport_details",
// 			args: {
// 				travel_docname: frm.doc.travel_request_id
// 			},
// 			callback: function(response) {
				

// 				var data = response.message;
// 				if (!data[0]== '') { 
// 					frm.doc.transportation_details = [];
// 					frm.set_value('transportation_details','');
// 					for (var i = 0; i < data.length; i++) {
						
						
// 						var row = frappe.model.add_child(frm.doc, "Particular Details Fare EXP", "transportation_details");
// 						row.description = data[i][0] + " - " + data[i][1];
// 						row.paid_by_company_amount = data[i][2];
// 					}
// 					frm.refresh_field("transportation_details");
// 					frm.set_df_property("transportation_details", "read_only", 1);
// 					frm.set_value('transport_booked_by_company', 1);
					
// 				}
// 				else{
// 					frm.set_value('transport_booked_by_company', '');
// 					frm.set_df_property("transportation_details", "read_only", 0);

// 				}
// 			}
// 		});	
//     }
// });


frappe.ui.form.on('Expense Claim EXP', {
    refresh: function(frm) {
 
        frappe.call({
            method: "frappe.travel_management_app.doctype.expense_claim_exp.expense_claim_exp.get_transport_details",
            args: {
                travel_docname: frm.doc.travel_request_id
            },
            callback: function(response) {
                var numRows = frm.doc.transportation_details.length;
                var data = response.message;
                var lenght = data.length;
                if(lenght>numRows){
                    if (data[0] !== '') { 
                        frm.doc.transportation_details = [];
                        for (var i = 0; i < data.length; i++) {
                            var row = frappe.model.add_child(frm.doc, "Particular Details Fare EXP", "transportation_details");
                            row.description = data[i][0] + " - " + data[i][1];
                            row.paid_by_company_amount = data[i][2];
                        }
                        frm.refresh_field("transportation_details");
                        frm.set_df_property("transportation_details", "read_only", 1);
                        frm.set_value('transport_booked_by_company', 1);
                        frm.save(); 
                        
                    }
                    else{
                        frm.set_value('transport_booked_by_company', '');
                        frm.set_df_property("transportation_details", "read_only", 0);

                    }
                }
            }
        });
    
	}
});

frappe.ui.form.on('Expense Claim EXP', {
    refresh: function(frm) {
        
		if(frm.doc.transport_booked_by_company == 1){
			frm.refresh_field("transportation_details");
            frm.set_df_property("transportation_details", "read_only", 1);
            
			
		}



		
    }
});

frappe.ui.form.on('Expense Claim EXP', {
	refresh: function(frm) {
		frappe.call({
			method: "frappe.travel_management_app.doctype.expense_claim_exp.expense_claim_exp.get_stay_details",
			args: {
				stay_docname: frm.doc.travel_request_id
			},
			callback: function(response) {
				var numRows = frm.doc.stay_details.length;
                var data = response.message;
                var lenght = data.length;
                if(lenght>numRows){
					if (!data[0]== '') { 
						frm.doc.stay_details = [];
					
						for (var i = 0; i < data.length; i++) {
							var row = frappe.model.add_child(frm.doc, "Particular Details Stay EXP", "stay_details");
							row.description = data[i][0] + " - " + data[i][1];
							row.paid_by_self_amount = data[i][2];
						}
						frm.refresh_field("stay_details");
						frm.set_df_property("stay_details", "read_only", 1);
						frm.set_value('stay_booked_by_company', 1);
						
					}
					else{
						frm.set_value('stay_booked_by_company', '');
						frm.set_df_property("stay_details", "read_only", 0);

					}
			}}
		});
	
	
		
    }
});



frappe.ui.form.on('Expense Claim EXP', {
    refresh: function(frm) {
		
		if(frm.doc.stay_booked_by_company == 1){
			frm.refresh_field("stay_details");
            frm.set_df_property("stay_details", "read_only", 1);
		
            
			
		}		
    }
});

frappe.ui.form.on('Expense Claim EXP', {
    view_advance_details: function(frm) {
        frappe.call({
            method: 'frappe.travel_management_app.doctype.expense_claim_exp.expense_claim_exp.get_advance__list_promt',
            args: {
                employee_id: frm.doc.employee_id,
                travel_request_exp: frm.doc.travel_request_id
            },
            callback: function(response) {
                var options_html = response.message;

                frappe.prompt([
                    {
                        fieldname: 'html_field',
                        fieldtype: 'HTML',
                        label: 'HTML Field',
                        options: options_html,
                        reqd: true
                    }
                ], function(values){
                    // Handle the prompt values if needed
                }, 'Advance Issued ', 'OK');
            }
        });
    }
});




frappe.ui.form.on('Expense Claim EXP', {
    refresh: function(frm) {
        if (frm.doc.travel_extension_checker == 1) {
            frm.set_intro('Please Note that this Expense Claim is created against an Extended Travel Request', 'red');
            frm.fields_dict.travel_request_id.$input.css('color', 'red');
        }
    }
});

frappe.ui.form.on("Expense Claim EXP", {
    download_form: function(frm) {
        
		var form_name = frm.doc.name;
		var url = `http://192.168.10.21:8002/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Expense%20Claim%20EXP&name=["${form_name}"]&format=Expense%20Claim%20Form&no_letterhead=1&letterhead=No%20Letterhead&options={"page-size":"A4"}`;
		// var url = `http://192.168.10.21:8000/printview?doctype=Expense%20Claim%20EXP&name=["${form_name}"]&format=Expense%20Claim%20Form&no_letterhead=0&letterhead=Expense%20Claim%20Form&settings=%7B%7D&_lang=en`
		window.open(url);
            
        
    }
});

frappe.ui.form.on('Expense Claim EXP',{
    refresh:function(frm){
        if (frappe.user.has_role('Finance Head')) {
			frm.set_df_property('expense_issued', 'read_only',0);
    }
  }
});



