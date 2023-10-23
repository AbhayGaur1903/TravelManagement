frappe.pages['approvers-documentat'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Manager, FInance and Travel desk Documentation',
		single_column: true
	});
	$(page.main).append('<iframe src="https://scribehow.com/embed/Step-by-Step_Guide_Approving_and_Managing_Travel_Requests_and_Expenses__H947I9_SQjGylCB6lGYSow?as=scrollable&skipIntro=true" width="100%" height="640" allowfullscreen frameborder="0"></iframe>');

}

