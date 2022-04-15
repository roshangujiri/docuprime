({
	getLatestVersion : function(component, event, helper) {

		component.set("v.spinner", true); 

		var action = component.get("c.getLatestVersion");

		if (component.get("v.templateRecord.Template_Version__c") =='1.0' ||
			component.get("v.templateRecord.Template_Version__c") ==null  )
		{
        	action.setParams({ recordId : component.get("v.recordId") });
		}
		else
		{
			action.setParams({ recordId : component.get("v.templateRecord.Parent_Template__c") });
		}	

        
		action.setCallback(this, function(response) {
			component.set("v.spinner", false); 
            var state = response.getState();
            if (state === "SUCCESS") {
				component.set("v.templateVersion",  response.getReturnValue()); 
			}
            else if (state === "INCOMPLETE") {
                // do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });

         
        $A.enqueueAction(action);
    }

})