({
    doInit: function (component, event, helper) {
        // $A.get("e.force:closeQuickAction").fire();
        
        // var evt = $A.get("e.force:navigateToComponent");
        // evt.setParams({
        //     componentDef : "c:templateEditor",
        //     componentAttributes: {
        //         templateId : component.get("v.recordId"),
        //         isRecordClone : true
        //     }
        // });
        // evt.fire();
    },


    recordUpdate: function (component, event, helper) {

        if (component.get("v.templateRecord.Is_Active__c") == false) {
            component.set("v.spinner", false);

            let newTemplateName=component.get("v.templateRecord.Name");
            component.set("v.templateType", 'NEWTEMPLATE'); 
            component.set("v.templateVersion", '1.0');
            component.set("v.isDisabledTemplateName", false);
            component.set("v.templateName", "");
            component.set("v.isDisabledCloneOption", true);

        }
        else {
            component.set("v.templateName", component.get("v.templateRecord.Name"));
            helper.getLatestVersion(component, event, helper);
        }

       
       
    },

    saveClick: function (component, event, helper) {
        
        component.set("v.spinner", true); 

        
        let templateType = component.get("v.templateType");
        let templateName = component.get("v.templateName");
        
        if (templateType=='NEWVERSION') {

            helper.getLatestVersion(component, event, helper);
            let NewtemplateVersion=component.get("v.templateVersion");
            let parentTemplateId=''
            
            if (component.get("v.templateRecord.Template_Version__c") =='1.0' ||
			    component.get("v.templateRecord.Template_Version__c") ==null  )
		    {
                 parentTemplateId=component.get("v.recordId");
            }
            else
            {
                if (component.get("v.templateRecord.Parent_Template__c")!=null){
                    parentTemplateId=component.get("v.templateRecord.Parent_Template__c");
                }
                else{
                    parentTemplateId=component.get("v.recordId");
                }
                 
            }

            
            $A.get("e.force:closeQuickAction").fire();
            var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef: "c:templateEditor",
                componentAttributes: {
                    templateId: component.get("v.recordId"),
                    isRecordClone: true,
                    isCloneNewVersion:true,
                    versionNumber:NewtemplateVersion,
                    parentTemplateId:parentTemplateId
                }
            });
            evt.fire();
        } else 
        {
            
            $A.get("e.force:closeQuickAction").fire();
            var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef: "c:templateEditor",
                componentAttributes: {
                    templateId: component.get("v.recordId"),
                    isRecordClone: true,
                    isCloneNewVersion:false,
                    templateName:templateName
                }
            });
            evt.fire();  
           
        }
    },

    cancelClick: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    handleChange : function(component, event, helper) {
         
        let templateType = component.get("v.templateType");
        let newTemplateName=component.get("v.templateRecord.Name");
         
        if (templateType=='NEWVERSION') {
            helper.getLatestVersion(component, event, helper);

            component.set("v.isDisabledTemplateName",true);
            component.set("v.templateName",newTemplateName);
        }
        else
        {
            component.set("v.templateVersion", '1.0');
            component.set("v.isDisabledTemplateName", false);
            component.set("v.templateName", "");
        }

      
       
    }
    
})