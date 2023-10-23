frappe.pages['how-to-use-expedien-'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '',
		single_column: true
	});

	

    $(page.main).append('<iframe src="https://scribehow.com/embed/Guide_to_filling_out_a_Travel_Request__Advance_Request_Expense_Claim_Form__YkihpXtrSrmcT6Ks55LTTg?as=scrollable&skipIntro=true" width="100%" height="640" allowfullscreen frameborder="0"></iframe>');
    
	


}
