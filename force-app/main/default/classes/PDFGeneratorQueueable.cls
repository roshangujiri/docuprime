public with sharing class PDFGeneratorQueueable implements Queueable, Database.AllowsCallouts {
    
    public List<Domain.CorporateDocumentPDFAttachmentWrapper> cropDocPDFList;
    public List<Domain.WebhookCalloutWrapper> webhookCalloutWrapperDataWrapper;
    public List<Id> corpDocIdsList;
    public Boolean sendDocumentForEsign;
    public static String requestPayloadData;
    
    public PDFGeneratorQueueable(List<Domain.CorporateDocumentPDFAttachmentWrapper> cropDocPDFList,
                                 List<Domain.WebhookCalloutWrapper> webhookCalloutDataWrapper,
                                 Boolean sendDocumentForEsign) 
    {
        this.cropDocPDFList = cropDocPDFList;
        this.webhookCalloutWrapperDataWrapper = webhookCalloutDataWrapper;
        this.sendDocumentForEsign = sendDocumentForEsign;
    }
    
    public void execute(QueueableContext context) {
        List<Id> cropDocIds = new List<Id>();
        // get corporate document Ids to delete croporate document and Document Content after creating the pdf attachment
        for(Domain.CorporateDocumentPDFAttachmentWrapper cropdocWrapper : cropDocPDFList) {
            cropDocIds.add(cropdocWrapper.corporateDocumenId);
        }
        corpDocIdsList = cropDocIds;
        List<Domain.CorporateDocumentPDFAttachmentWrapper> cropDocPDFListWithContentVersionId = 
            new List<Domain.CorporateDocumentPDFAttachmentWrapper>();
        List<Domain.CorporateDocumentPDFAttachmentWrapper> cropDocPDFListWithContentVersionIdsendForEsign = 
            new List<Domain.CorporateDocumentPDFAttachmentWrapper>();
        List<Domain.eSignCalloutDataWrapper> esignCalloutDataWrapperList = 
            new List<Domain.eSignCalloutDataWrapper>();
        List<ContentVersion> contentVersionListToInsert = new List<ContentVersion>();
        if(Schema.sObjectType.ContentVersion.fields.Title.isCreateable() &&
          Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable() &&
          Schema.sObjectType.ContentVersion.fields.DocuPad_RelatedRecord_Id__c.isCreateable() &&
          Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable()) {
            for(Domain.CorporateDocumentPDFAttachmentWrapper userInputWrapper : cropDocPDFList) {
                PageReference pdfPageRef = page.ViewPDF;
                pdfPageRef.getParameters().put('id', userInputWrapper.corporateDocumenId);
                ContentVersion conVer = new ContentVersion();
                conVer.Title = userInputWrapper.corporateDocumentName + '.pdf';
                conVer.PathOnClient = userInputWrapper.corporateDocumentName + '.pdf';
                conVer.DocuPad_RelatedRecord_Id__c = userInputWrapper.relatedRecordId;
                if(Test.isRunningTest()) {
                    conVer.VersionData = Blob.valueOf('Unit.Test');
                }
                else {
                    conVer.VersionData = pdfPageRef.getContentAsPDF();
                }
                contentVersionListToInsert.add(conVer);
            }
            INSERT contentVersionListToInsert;
        }
        // Adding Domain.CorporateDocumentPDFAttachmentWrapper to cropDocPDFListWithContentVersionId with contentVersion Id
        for(Integer i = 0; i < cropDocPDFList.Size(); i++) {
            Domain.CorporateDocumentPDFAttachmentWrapper cropDocwrapperObjWithContentVersionId = cropDocPDFList[i];
            ContentVersion conVerionObj = contentVersionListToInsert[i];
            cropDocwrapperObjWithContentVersionId.contentVersionId = conVerionObj.Id;
            cropDocPDFListWithContentVersionId.add(cropDocwrapperObjWithContentVersionId);
        }
        // filtering cropDocwrapperObjWithContentVersionId with sendForEsign = true and adding to new List
        for(Domain.CorporateDocumentPDFAttachmentWrapper pdfWrapper : cropDocPDFListWithContentVersionId) {
            if(pdfWrapper.sendForEsign == true) {
                cropDocPDFListWithContentVersionIdsendForEsign.add(pdfWrapper);
            }
        }
        // creating EsignWrapper Object to pass to callout method
        if(!webhookCalloutWrapperDataWrapper.isEmpty() && !cropDocPDFListWithContentVersionIdsendForEsign.isEmpty()) {
            for(Integer i = 0; i < webhookCalloutWrapperDataWrapper.Size(); i++) {
                Domain.WebhookCalloutWrapper webhookCalloutWrapperDataWrapperObj = webhookCalloutWrapperDataWrapper[i];
                Domain.CorporateDocumentPDFAttachmentWrapper cropDocPDFWrapperObj = cropDocPDFListWithContentVersionIdsendForEsign[i];
                Domain.eSignCalloutDataWrapper eSignDataWrapper = new Domain.eSignCalloutDataWrapper();
                eSignDataWrapper.contentVersionId = cropDocPDFWrapperObj.contentVersionId;
                eSignDataWrapper.approverEmail = WebhookCalloutWrapperDataWrapperObj.approverEmail;
                eSignDataWrapper.approverName = WebhookCalloutWrapperDataWrapperObj.approverName;
                esignCalloutDataWrapperList.add(eSignDataWrapper);
            }
        }
        createContentDocumentLink(contentVersionListToInsert); // calling second methods
        if(!esignCalloutDataWrapperList.isEmpty() && sendDocumentForEsign) {
            //Profile profileId = [SELECT Id FROM Profile WHERE Name='System Administrator' WITH SECURITY_ENFORCED LIMIT 1];
            //Document_Esign__c customSettings = Document_Esign__c.getInstance(profileId.Id);
            Document_Esign__c customSettings = Document_Esign__c.getInstance();
            Domain.ESignWebhookWrapper esignWebhookWrapper = new Domain.ESignWebhookWrapper();
            esignWebhookWrapper.service = customSettings.Esign_Service__c;
            esignWebhookWrapper.documentInfo = esignCalloutDataWrapperList;
            /*if(customSettings.Use_LWAPIC__c) {
                List<ICChannelRequest> channelList = new List<ICChannelRequest>();
                ICChannelRequest channel = new ICChannelRequest();
                channel.channelName = customSettings.Active_Esign_Channel__c;
                requestPayloadData = JSON.serialize(esignWebhookWrapper);
                channelList.add(channel);
                ICControllerASync.execute(channelList);
            } else {*/
                WebhookCallout.makeGetCalloutForEsignBulkified(JSON.serialize(esignWebhookWrapper), customSettings.Esign_Webhook_URL__c);
            //}
        }
    }

    public static String setCustomRequestJson() {
        return requestPayloadData;
    }
    
    public void createContentDocumentLink(List<ContentVersion> contentVersionList) {
        List<ContentDocumentLink> contentDocumentLinkListToInsert = new List<ContentDocumentLink>();
        List<ContentDocumentLink> contDocLinkToShareWithAdminList = new List<ContentDocumentLink>();
        List<Domain.CorporateDocumentPDFAttachmentWrapper> corDocPDFListWithContentDocumentId = 
            new List<Domain.CorporateDocumentPDFAttachmentWrapper>();
        List<Id> contentVersionIds = new List<Id>();
        Map<Id, ContentVersion> contVerMap = new Map<Id, ContentVersion>();
        Profile profileId = [SELECT Id FROM Profile WHERE Name='System Administrator' LIMIT 1];
        Document_Esign__c customSettings = Document_Esign__c.getInstance(profileId.Id);
        User loggedInUser = [SELECT Id, Name, Username FROM User WHERE Id = :UserInfo.getUserId()];
        User customSettingsAdminUser = new User();
        if(customSettings.Esign_Admin_User_Name__c != Null) {
            customSettingsAdminUser = [SELECT id, name FROM User WHERE Username = :customSettings.Esign_Admin_User_Name__c WITH SECURITY_ENFORCED];
        } 
        for(ContentVersion conVer : contentVersionList) {
            contentVersionIds.add(conVer.Id);
        } 
        List<ContentVersion> conVersionDataBaseList = [SELECT Id, ContentDocumentId, DocuPad_RelatedRecord_Id__c 
                                                       FROM ContentVersion 
                                                       WHERE Id = :contentVersionIds WITH SECURITY_ENFORCED];
        for(ContentVersion conVer : conVersionDataBaseList) {
            contVerMap.put(conVer.Id, conVer);
        } 
        for(ContentVersion conVer : conVersionDataBaseList) {
            for(Domain.CorporateDocumentPDFAttachmentWrapper userInput : cropDocPDFList) {
                if(userInput.relatedRecordId == conVer.DocuPad_RelatedRecord_Id__c) {
                    ContentVersion contentVersion = contVerMap.get(conVer.Id);
                    userInput.contentDocumentId = contentVersion.ContentDocumentId;
                    corDocPDFListWithContentDocumentId.add(userInput);
                }
            }
        }
        for(Domain.CorporateDocumentPDFAttachmentWrapper pdfwrapper : corDocPDFListWithContentDocumentId) {
            ContentDocumentLink contDocLink = new ContentDocumentLink();
            contDocLink.ContentDocumentId = pdfwrapper.contentDocumentId;
            contDocLink.LinkedEntityId = pdfwrapper.relatedRecordId;
            contentDocumentLinkListToInsert.add(contDocLink);
            // creating ContentDocumentLink to share with the admin user
            if(sendDocumentForEsign && customSettings.Esign_Admin_User_Name__c != Null 
            && customSettingsAdminUser.Name != Null 
            && loggedInUser.Username != customSettings.Esign_Admin_User_Name__c) {
                   ContentDocumentLink contDocLinkToShareWithAdmin = new ContentDocumentLink();
                   contDocLinkToShareWithAdmin.ContentDocumentId = pdfwrapper.contentDocumentId;
                   contDocLinkToShareWithAdmin.LinkedEntityId = customSettingsAdminUser.Id;
                   contDocLinkToShareWithAdminList.add(contDocLinkToShareWithAdmin);
               } 
        }
        SObjectAccessDecision securityDecision = Security.stripInaccessible(
                                         AccessType.CREATABLE, contentDocumentLinkListToInsert);
        INSERT securityDecision.getRecords();
        // inserting ContentDocumentLink to share with the admin user
        if(!contDocLinkToShareWithAdminList.isEmpty()) {
            SObjectAccessDecision securityDecisionCDAdmin = Security.stripInaccessible(
                                         AccessType.CREATABLE, contDocLinkToShareWithAdminList);
            INSERT securityDecisionCDAdmin.getRecords();
        }
        //Delete Document content and corporate Docuemnt after creating PDF attchment
        deleteCorporateDocuments(corpDocIdsList);
    }

    @future
    public static void deleteCorporateDocuments(List<Id> corpDocIdsList) {
        
        if(Schema.sObjectType.Document_Content__c.isAccessible()){
            List<Document_Content__c> documentContentList = [SELECT Id 
                    FROM Document_Content__c 
                    WHERE Corporate_Document__c = :corpDocIdsList WITH SECURITY_ENFORCED];

            if(Document_Content__c.sObjectType.getDescribe().isDeletable()) {
                DELETE documentContentList;
            }
        }

        if(Schema.sObjectType.Corporate_Document__c.isAccessible()){
            List<Corporate_Document__c> cropdocListToDelete = [SELECT Id 
                    FROM Corporate_Document__c
                    WHERE Id = :corpDocIdsList WITH SECURITY_ENFORCED];

            if(Corporate_Document__c.sObjectType.getDescribe().isDeletable()) {
                DELETE cropdocListToDelete;
            }
        }
    }
}