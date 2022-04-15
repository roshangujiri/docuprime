trigger DocumentTrigger on Document_Template__c (before insert, before update, after insert, after update) {
    if(Trigger.isBefore && trigger.IsInsert){
      DocumentTemplateHandler.isBeforeInsert(Trigger.New);
    }
	
    if(Trigger.isBefore && trigger.IsUpdate){
        DocumentTemplateHandler.isBeforeUpdate(Trigger.New);
    }
	
    if(Trigger.isAfter){
        if(Trigger.isInsert){
            DocumentTemplateHandler.isAfterInsert(Trigger.New);
        }
        if(Trigger.isUpdate){
            DocumentTemplateHandler.isAfterUpdate(Trigger.New);
        }
    }
}