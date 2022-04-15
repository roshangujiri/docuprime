global inherited sharing class AutoGenerateDocumentWrapperWithIdList {
    @InvocableVariable(label='Parent record Ids ' description='Parent record Id' required=true)
    global List<Id> recordIds;
    
    @InvocableVariable(label='Template Name' description= 'Template Name' required=true)
    global String templateName;
    
    @InvocableVariable(label='Attach Document?' description= 'Is document required to attach to record?' required=true)
    global Boolean attachDocument;
    
    @InvocableVariable(label='Send document for Esign?' description= 'Is document required to send for Esign?' required=true)
    global Boolean sendForEsign;

}