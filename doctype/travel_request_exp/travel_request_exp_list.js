// frappe.listview_settings['Travel Request EXP'] = {
//     onload: function(listview) {
//         var auto_id_emp;
//         frappe.call({
//             method: 'frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.get_list_context',
//             callback: function(response) {
//                 var data = response.message;
//                 auto_id_emp = data;
                

                
//             }
//         })
// 		// Modify the list view query to filter documents where the 'approver' field is set to 'EXEMP-0034/Anand'
// 		listview.page.fields_dict['approver'].get_query = function() {
// 			return {
// 				filters: {
// 					auto_id: auto_id_emp
// 				}
// 			};

// 		};
        

// 		// Refresh the list view to apply the modified query and show the filtered list
// 		listview.refresh();
// 	}
// };


// frappe.listview_settings['Travel Request EXP'] = {
//     onload(listview){
//         frappe.call({
//             method:'frappe.travel_management_app.doctype.travel_request_exp.travel_request_exp.get_list_context',
//             callback: function(response){
//                 var data = response.message;
//                 frappe.msgprint(`${data}`);
                
//             }


//         })
//     }
// }s
