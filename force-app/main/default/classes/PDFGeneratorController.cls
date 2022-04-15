/**
 * @name         :    PDFGeneratorController
 * @description  :    
 */
public with sharing class PDFGeneratorController {
    @AuraEnabled
    public static Id saveAsPDFAttachment(Id recordId, Id documentId, String documentName) {
        
        PageReference pdfPageRef = page.ViewPDF;
        pdfPageRef.getParameters().put('id', documentId);
        
        if(Schema.sObjectType.ContentVersion.fields.Title.isCreateable() &&
           Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable() &&
           Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable()) {
               ContentVersion conVer = new ContentVersion();
               conVer.Title = documentName + '.pdf';
               conVer.PathOnClient = documentName + '.pdf';
               if(Test.isRunningTest()) {
                   conVer.VersionData = Blob.valueOf('Unit.Test');
               }
               else {
                   conVer.VersionData = pdfPageRef.getContentAsPDF();
               }
               INSERT conVer; 
            
               Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :conVer.Id WITH SECURITY_ENFORCED].ContentDocumentId;
               
               ContentDocumentLink contDocLink = new ContentDocumentLink();
               contDocLink.ContentDocumentId = conDoc;
               contDocLink.LinkedEntityId = recordId;
               SObjectAccessDecision securityDecisionContDocLink = Security.stripInaccessible(
                                         AccessType.CREATABLE, new List<ContentDocumentLink> {contDocLink});
               INSERT securityDecisionContDocLink.getRecords();

               //INSERT contDocLink;
               // creating and inserting ContentDocumentLink to share with admin user
               Profile profileId = [SELECT Id FROM Profile WHERE Name='System Administrator' WITH SECURITY_ENFORCED LIMIT 1];
               User userobj = [SELECT Id, Name, Username FROM User WHERE Id = :UserInfo.getUserId() WITH SECURITY_ENFORCED];
               Document_Esign__c customSettings = Document_Esign__c.getInstance(profileId.Id);
               if(customSettings.Esign_Admin_User_Name__c != Null && userobj.Username != customSettings.Esign_Admin_User_Name__c) {
                   User adminUser = [SELECT id, name FROM User WHERE Username = :customSettings.Esign_Admin_User_Name__c WITH SECURITY_ENFORCED];
                   ContentDocumentLink contDocLinkToShareWithAdmin = new ContentDocumentLink();
                   contDocLinkToShareWithAdmin.ContentDocumentId = conDoc;
                   contDocLinkToShareWithAdmin.LinkedEntityId = adminUser.Id;
                   SObjectAccessDecision securityDecision = Security.stripInaccessible(
                                         AccessType.CREATABLE, new List<ContentDocumentLink> {contDocLinkToShareWithAdmin});
                   INSERT securityDecision.getRecords();
                   //INSERT contDocLinkToShareWithAdmin;
               } 
               return conVer.Id;
           } else {
               return Null;
           }
    }
    
    @AuraEnabled
    public static void saveDocumentAndSendForEsign(
        Id recordId, 
        Id documentId, 
        String documentName,
        String serviceName,
        String approverEmail,
        String approverName) 
    {
        Id contentVersionId = saveAsPDFAttachment(recordId, documentId, documentName);
        /*List<ICChannelRequest> channelList = new List<ICChannelRequest>();
        ICChannelRequest channel = new ICChannelRequest();*/
        Profile profileId = [SELECT Id FROM Profile WHERE Name='System Administrator' WITH SECURITY_ENFORCED LIMIT 1];
        Document_Esign__c customSettings = Document_Esign__c.getInstance(profileId.Id);
        String customsettingsChannelName = customSettings.Active_Esign_Channel__c;
        /*channel.channelName = customsettingsChannelName;
        channel.recordId = recordId;
        channelList.add(channel);*/
        Domain.eSignCalloutDataWrapper eSignDataWrapper = new Domain.eSignCalloutDataWrapper();
        eSignDataWrapper.contentVersionId = contentVersionId;
        eSignDataWrapper.approverEmail = approverEmail;
        eSignDataWrapper.approverName = approverName;
        List<Domain.eSignCalloutDataWrapper> wrapperList = new List<Domain.eSignCalloutDataWrapper>();
        wrapperList.add(eSignDataWrapper);
        Domain.ESignWebhookWrapper esignWebhookWrapper = new Domain.ESignWebhookWrapper();
        esignWebhookWrapper.service = customSettings.Esign_Service__c;
        esignWebhookWrapper.documentInfo = wrapperList;
        WebhookCallout.makeGetCalloutForEsignBulkified(JSON.serialize(esignWebhookWrapper), customSettings.Esign_Webhook_URL__c);
    }
}