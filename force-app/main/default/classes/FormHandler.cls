/**
 * @name         :    FormHandler
 * @description  :    Contains methods to query template, section, fields and document objects
 *                    and perform DML on section and document objects.
 */
public with sharing class FormHandler {
    
    public static final String BODY = 'Body';
    public static final String PAGE_BREAK = 'Page Break';
    public static final String BLANK_PAGE = 'Blank Page';
    public static final String RELATED_RECORDS = 'Related Records';
    public static final String CUSTOM_CONTENT = 'Custom Content';
    public static final String PICKLIST = 'Picklist';
    
    /**
     * @description  :    Queries template based on template type/category.
     * @param        :    String formCategory
     * @return       :    List<DocumentTemplate> - List of templates.
     */
    @AuraEnabled(cacheable=true)
    public static List<DocumentTemplate> getFormList(String formCategory) {
        List<Document_Template__c> docTemplateList = new List<Document_Template__c>();
        List<DocumentTemplate> docTemplateWrapList = new List<DocumentTemplate>();
        docTemplateList =  [SELECT Id, Name, Template_Type__c, Template_Version__c, Is_Active__c,
                            (SELECT Id
                             FROM Corporate_Document__r
                             WHERE ownerId = :UserInfo.getuserid()),
                            (SELECT Id
                             FROM TempContents__r)
                            FROM Document_Template__c 
                            WHERE Template_Type__c = :formCategory
                            AND Is_Active__c = true WITH SECURITY_ENFORCED];
        for(Document_Template__c docTemplate : docTemplateList) {
            DocumentTemplate docTemplateWrap = new DocumentTemplate();
            docTemplateWrap.id = docTemplate.Id;
            docTemplateWrap.name = docTemplate.Name;
            docTemplateWrap.templateType = docTemplate.Template_Type__c;
            docTemplateWrap.templateVersion = docTemplate.Template_Version__c;
            docTemplateWrap.isActive = docTemplate.Is_Active__c;
            docTemplateWrap.isCorpDocListEmpty = docTemplate.Corporate_Document__r.IsEmpty() ? true : false;
            docTemplateWrap.isSectionListEmpty = docTemplate.TempContents__r.IsEmpty() ? true : false;
            docTemplateWrapList.add(docTemplateWrap);
        }
        return docTemplateWrapList;
    }
    
    /**
     * @description  :    Queries template based on template id and related record id.
     * @param        :    Id templateId, String relatedRecordId
     * @return       :    DocumentTemplate - template wrapper object instance
     */
    @AuraEnabled(cacheable=true)
    public static DocumentTemplate getTemplateById(Id templateId, String relatedRecordId) {
        List<Document_Template__c> docTemplateList = new List<Document_Template__c>();
        docTemplateList =  [SELECT Id, Name, Template_Type__c, Template_Version__c, Is_Active__c,
                            (SELECT Id
                             FROM Corporate_Document__r
                             WHERE ownerId = :UserInfo.getuserid()
                             AND Related_Record__c = :relatedRecordId),
                            (SELECT Id
                             FROM TempContents__r)
                            FROM Document_Template__c 
                            WHERE Id = :templateId
                            AND Is_Active__c = true WITH SECURITY_ENFORCED];
        
        DocumentTemplate docTemplateWrap = new DocumentTemplate();
        if(!docTemplateList.isEmpty()) {
            Document_Template__c docTemplate = docTemplateList[0];
            docTemplateWrap.id = docTemplate.Id;
            docTemplateWrap.name = docTemplate.Name;
            docTemplateWrap.templateType = docTemplate.Template_Type__c;
            docTemplateWrap.templateVersion = docTemplate.Template_Version__c;
            docTemplateWrap.isActive = docTemplate.Is_Active__c;
            docTemplateWrap.isCorpDocListEmpty = docTemplate.Corporate_Document__r.IsEmpty() ? true : false;
            docTemplateWrap.isSectionListEmpty = docTemplate.TempContents__r.IsEmpty() ? true : false;
        }
        return docTemplateWrap;
    }
    
    /**
     * @description  :    Queries template based on template id.
     * @param        :    Id templateId
     * @return       :    DocumentTemplate - template wrapper object instance
     */
    @AuraEnabled(cacheable=true)
    public static DocumentTemplate getDocumentTemplate(Id templateId) {
        List<Document_Template__c> docTemplateList = new List<Document_Template__c>();
        DocumentTemplate documentTemplate = new DocumentTemplate();
        docTemplateList = [SELECT Id, Name, Template_Type__c, Template_Version__c, Is_Active__c,Is_Default__c,
                            Allow_Esign__c, Additional_Info__c, Department__c, Business_Unit__c,Description__c, 
                            Allow_Attach_As_PDF__c, Allow_Send_As_Email_Attachment__c
                           FROM Document_Template__c 
                           WHERE Id = :templateId
                           AND Is_Active__c = true WITH SECURITY_ENFORCED];
        if(!docTemplateList.isEmpty()) {
            documentTemplate.id = docTemplateList[0].Id;
            documentTemplate.name = docTemplateList[0].Name;
            documentTemplate.templateType = docTemplateList[0].Template_Type__c;
            documentTemplate.templateVersion = docTemplateList[0].Template_Version__c;
            documentTemplate.isActive = docTemplateList[0].Is_Active__c;
            documentTemplate.isDefault = docTemplateList[0].Is_Default__c;
            documentTemplate.department = docTemplateList[0].Department__c;
            documentTemplate.businessUnit = docTemplateList[0].Business_Unit__c;
            documentTemplate.description = docTemplateList[0].Description__c;
            if (!docTemplateList[0].Allow_Attach_As_PDF__c || !docTemplateList[0].Allow_Send_As_Email_Attachment__c) {
                App_Settings__c customSettingRec = App_Settings__c.getInstance();
                if (!docTemplateList[0].Allow_Attach_As_PDF__c && docTemplateList[0].Allow_Send_As_Email_Attachment__c) {
                    documentTemplate.allowAttachAsPDF = customSettingRec.Attach_as_PDF__c;
                    documentTemplate.allowSendAsEmailAttachment = docTemplateList[0].Allow_Send_As_Email_Attachment__c;
                } else if (docTemplateList[0].Allow_Attach_As_PDF__c && !docTemplateList[0].Allow_Send_As_Email_Attachment__c) {
                    documentTemplate.allowAttachAsPDF = docTemplateList[0].Allow_Attach_As_PDF__c;
                    documentTemplate.allowSendAsEmailAttachment = customSettingRec.Compose_Email__c;
                } else if (!docTemplateList[0].Allow_Attach_As_PDF__c && !docTemplateList[0].Allow_Send_As_Email_Attachment__c) {
                    documentTemplate.allowAttachAsPDF = customSettingRec.Attach_as_PDF__c;
                    documentTemplate.allowSendAsEmailAttachment = customSettingRec.Compose_Email__c;
                }
            } else {
                documentTemplate.allowAttachAsPDF = docTemplateList[0].Allow_Attach_As_PDF__c;
                documentTemplate.allowSendAsEmailAttachment = docTemplateList[0].Allow_Send_As_Email_Attachment__c;
            }
            documentTemplate.allowEsign = docTemplateList[0].Allow_Esign__c;
            documentTemplate.additionalInfoJSON = docTemplateList[0].Additional_Info__c;
        }
        return documentTemplate;
    }
    
    /**
     * @description  :    Upserts Document_Content__c object records.
     * @param        :    List<Document_Content__c> docContentList
     * @return       :    void
     */
    @AuraEnabled
    public static void upsertDocContentList(List<Document_Content__c> docContentList) {
        SObjectAccessDecision securityDecision = Security.stripInaccessible(
                                         AccessType.UPSERTABLE, docContentList);
        UPSERT securityDecision.getRecords();
    }
    
    /**
     * @description  :    Deletes the document and related sections with specified document id.
     * @param        :    Id documentId
     * @return       :    void
     */
    @AuraEnabled
    public static void deleteDocument(Id documentId) {
        if(Document_Content__c.sObjectType.getDescribe().isDeletable()) {
            DELETE [SELECT Id
            FROM Document_Content__c 
            WHERE Corporate_Document__c = :documentId WITH SECURITY_ENFORCED];
        }
        if(Corporate_Document__c.sObjectType.getDescribe().isDeletable()) {
            DELETE [SELECT Id FROM Corporate_Document__c WHERE Id = :documentId WITH SECURITY_ENFORCED];
        }
    }
     //ABDS:s:e: To get the refresed values
     @AuraEnabled
     public static List<Domain.SectionWrapper> getFormContentListPreview(Id formId) {
         return FormHandler.getFormContentList(formId);
     }
    
    /**
     * @description  :    Queries sections and related fields based on template id.
     * @param        :    Id formId
     * @return       :    List<Domain.SectionWrapper> - List of section wrapper object instances
     */
    @AuraEnabled(cacheable=true)
    public static List<Domain.SectionWrapper> getFormContentList(Id formId) {
        List<Document_Content__c> sectionList = new List<Document_Content__c>();
        List<Domain.SectionWrapper> secWrapList = new List<Domain.SectionWrapper>();
        List<Domain.FieldWrapper> fieldWrapList;
        sectionList = [SELECT Id, Content__c, Name, Order_Sequence__c, Section_Content__c, Content_Action__c, 
                       Content_Type__c, Visibility__c, Alignment__c, Query_JSON__c, Enable_Landscape_Layout__c,
                       Section_Key__c,
                       (SELECT Id, Name, Content__c, Order_Sequence__c, Field_Type__c, 
                        Placeholder_Content__c, Picklist_Values__c, Reference_Field__c,Date_Format__c 
                        FROM Contents__r
                        ORDER BY Order_Sequence__c ASC
                        NULLS LAST) 
                       FROM Document_Content__c 
                       WHERE Document_Template__c = :formId WITH SECURITY_ENFORCED
                       ORDER BY Order_Sequence__c ASC
                       NULLS LAST];
        for(Document_Content__c section : sectionList) {
            Domain.SectionWrapper secWrap = new Domain.SectionWrapper();
            secWrap.id = section.Id;
            secWrap.name = section.Name;
            secWrap.key = section.Section_Key__c;
            secWrap.orderSequence = section.Order_Sequence__c.intValue();
            secWrap.contentType = section.Content_Type__c;
            secWrap.isLandscapeLayout = section.Enable_Landscape_Layout__c;
            secWrap.isBodyContent = (section.Content_Type__c == BODY || section.Content_Type__c == CUSTOM_CONTENT || section.Content_Type__c == RELATED_RECORDS);
            secWrap.isCustomContent = section.Content_Type__c == CUSTOM_CONTENT;
            secWrap.isRelatedRecords = section.Content_Type__c == RELATED_RECORDS;
            secWrap.isPageBreak = section.Content_Type__c == PAGE_BREAK;
            secWrap.isBlankPage = section.Content_Type__c == BLANK_PAGE;
            secWrap.visibility = section.Visibility__c;
            secWrap.alignment = section.Alignment__c;
            secWrap.content = section.Section_Content__c;
            secWrap.queryJSON = section.Query_JSON__c;
            
            fieldWrapList = new List<Domain.FieldWrapper>();
            for(Document_Content__c field : section.Contents__r) {
                Domain.FieldWrapper fieldWrap = new Domain.FieldWrapper();
                fieldWrap.id = field.Id;
                fieldWrap.name = field.Name;
                fieldWrap.type = field.Field_Type__c;
                fieldWrap.isPicklist = fieldWrap.type == PICKLIST ? true : false;
                fieldWrap.orderSequence = field.Order_Sequence__c.intValue();
                fieldWrap.referenceField = field.Reference_Field__c;
                //ABDS:s:For FLS
                fieldWrap.isHidden = false;
                // if (String.isNotBlank(fieldWrap.referenceField))
                // {
                //     SObjectType schemaType = Schema.getGlobalDescribe().get(section.Document_Template__r.Parent_Object_Name__c);
                //     Map<String, SObjectField> mapObjectFields = schemaType.getDescribe().fields.getMap();
                //     System.debug('section.Document_Template__r.Parent_Object_Name__c');
                //     System.debug(section.Document_Template__r.Parent_Object_Name__c);
                //     System.debug(fieldWrap);
                //     string[] arrField=fieldWrap.referenceField.split('\\.');
                //     System.debug(arrField);
                //     if (!mapObjectFields.get(arrField[arrField.size()-1]).getDescribe().isAccessible()){
                //         fieldWrap.isHidden = true;
                //         //Continue;
                //     }	         
                // }
               
                //ABDS:e:For FLS
                
                fieldWrap.picklistValues = field.Picklist_Values__c;
                fieldWrap.placeholderContent = field.Placeholder_Content__c;
                fieldWrap.dateFormat = field.Date_Format__c;
                fieldWrapList.add(fieldWrap);
                System.debug('fieldWrap'+ field.Date_Format__c);
            }
            secWrap.fields = fieldWrapList;
            secWrapList.add(secWrap);
        }
        return secWrapList;
    } 
    
    /**
     * @description  :    Queries documents and related sections based on template id and related record.
     * @param        :    Id formId, String relatedRecordId, Integer pageNumber, Integer pageSize
     * @return       :    PagedResult - instance of PagedResult
     */
    @AuraEnabled(cacheable=true)
    public static PagedResult getDocumentList(
        Id formId, 
        String relatedRecordId,
        Integer pageNumber,
        Integer pageSize 
    ) {
        List<Corporate_Document__c> documentList = new List<Corporate_Document__c>();
        List<Domain.DocumentWrapper> documentWraptList = new List<Domain.DocumentWrapper>();
        List<Domain.SectionWrapper> secWrapList = new List<Domain.SectionWrapper>();
        String currentUserId = UserInfo.getuserid();
        
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        
        if(String.isBlank(relatedRecordId)) {
            result.totalItemCount = Database.countQuery(
                'SELECT count() FROM Corporate_Document__c WHERE Document_Template__c = :formId ' +
                ' AND ownerId = :currentUserId WITH SECURITY_ENFORCED'
            );
            documentList = [SELECT Id, Name, Document_Template__c, Document_Stage__c,lastModifiedDate,
                            (SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c 
                             FROM CorpContents__r
                             ORDER BY Order_Sequence__c ASC
                             NULLS LAST)
                            FROM Corporate_Document__c
                            WHERE Document_Template__c = :formId AND ownerId = :UserInfo.getuserid()
                            WITH SECURITY_ENFORCED ORDER BY CreatedDate LIMIT :pageSize OFFSET :offset];
        } else {
            result.totalItemCount = Database.countQuery(
                'SELECT count() ' +
                ' FROM Corporate_Document__c ' +
                ' WHERE Document_Template__c = :formId ' +
                ' AND Related_Record__c = :relatedRecordId ' +
                ' AND ownerId = :currentUserId WITH SECURITY_ENFORCED'
            );
            documentList = [SELECT Id, Name, Document_Template__c, Document_Stage__c,lastModifiedDate,
                            (SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c 
                             FROM CorpContents__r 
                             ORDER BY Order_Sequence__c ASC
                             NULLS LAST)
                            FROM Corporate_Document__c
                            WHERE Document_Template__c = :formId
                            AND Related_Record__c = :relatedRecordId AND ownerId = :UserInfo.getuserid()
                            WITH SECURITY_ENFORCED ORDER BY CreatedDate LIMIT :pageSize OFFSET :offset];
        }
       
        String dateformat = 'MM-dd-yyyy HH:mm:ss';
        for(Corporate_Document__c document : documentList) {
            Domain.DocumentWrapper documentWrap = new Domain.DocumentWrapper();
            documentWrap.lastModifiedDate = document.lastModifiedDate.format(dateformat,''+userinfo.getTimeZone().toString());
            documentWrap.id = document.Id;
            documentWrap.name = document.Name;
            documentWrap.templateId = document.Document_Template__c;
            documentWrap.stage = document.Document_Stage__c;
            for(Document_Content__c section : document.CorpContents__r) {
                Domain.SectionWrapper secWrap = new Domain.SectionWrapper();
                secWrap.id = section.Id;
                secWrap.name = section.Name;
                secWrap.orderSequence = section.Order_Sequence__c.intValue();
                secWrap.contentType = section.Content_Type__c;
                secWrap.isBodyContent = section.Content_Type__c == BODY;
                secWrap.content = section.Section_Content__c;
                secWrapList.add(secWrap);
            }
            documentWrap.sections = secWrapList;
            documentWraptList.add(documentWrap);
        } 
        result.records = documentWraptList;
        return result;
    }
    
    /**
     * @description  :    Queries a specific document by id.
     * @param        :    Id documentId
     * @return       :    Domain.DocumentWrapper - document wrapper instance
     */
    @AuraEnabled
    public static Domain.DocumentWrapper getDocumentById(Id documentId) {
        List<Corporate_Document__c> documentList = new List<Corporate_Document__c>();
        Domain.DocumentWrapper documentWrap = new Domain.DocumentWrapper();
        List<Domain.SectionWrapper> secWrapList = new List<Domain.SectionWrapper>();
        documentList = [SELECT Id, Name, Document_Template__c, Document_Stage__c,
                        (SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c, Enable_Landscape_Layout__c 
                         FROM CorpContents__r
                         ORDER BY Order_Sequence__c ASC
                         NULLS LAST)
                        FROM Corporate_Document__c
                        WHERE Id = :documentId WITH SECURITY_ENFORCED
                        LIMIT 1]; 
        if(!documentList.isEmpty()) {
            documentWrap.id = documentList[0].Id;
            documentWrap.name = documentList[0].Name;
            documentWrap.templateId = documentList[0].Document_Template__c;
            documentWrap.stage = documentList[0].Document_Stage__c;
            for(Document_Content__c section : documentList[0].CorpContents__r) {
                Domain.SectionWrapper secWrap = new Domain.SectionWrapper();
                secWrap.id = section.Id;
                secWrap.name = section.Name;
                secWrap.orderSequence = section.Order_Sequence__c.intValue();
                secWrap.contentType = section.Content_Type__c;
                secWrap.isLandscapeLayout = section.Enable_Landscape_Layout__c;
                secWrap.isBodyContent = (section.Content_Type__c == BODY || section.Content_Type__c == CUSTOM_CONTENT || section.Content_Type__c == RELATED_RECORDS);
                secWrap.isCustomContent = section.Content_Type__c == CUSTOM_CONTENT;
                secWrap.isRelatedRecords = section.Content_Type__c == RELATED_RECORDS;
                secWrap.isPageBreak = section.Content_Type__c == PAGE_BREAK;
                secWrap.isBlankPage = section.Content_Type__c == BLANK_PAGE;
                secWrap.content = section.Section_Content__c;
                secWrapList.add(secWrap);
            }
            documentWrap.sections = secWrapList;
        }
        return documentWrap;
    }
    
    /**
     * @description  :    Queries documents by template id and current user id.
     * @param        :    Id formId
     * @return       :    List<Corporate_Document__c> - list of documents
     */
    @AuraEnabled(cacheable=true)
    public static List<Corporate_Document__c> getDocumentByCurrentUserId(Id formId) {
        return [SELECT Id, Name, Document_Template__c, Document_Stage__c 
                FROM Corporate_Document__c
                WHERE Document_Template__c = :formId
                AND OwnerId = :UserInfo.getuserid() WITH SECURITY_ENFORCED]; 
    } 

    /**
     * @description  :    Counts the number of document for a specific template.
     * @param        :    Id formId
     * @return       :    Integer - An integer count
     */
    @AuraEnabled(cacheable=true)
    public static Integer getRecordCount(Id formId) {
        return [SELECT COUNT() 
                FROM Corporate_Document__c
                WHERE Document_Template__c = :formId
                AND OwnerId = :UserInfo.getuserid() WITH SECURITY_ENFORCED]; 
    }
    
    /**
     * @description  :    Queries templates to show in the picklist on UI.
     * @param        :    void
     * @return       :    List<Domain.PicklistOptionWrapper> - list of PicklistOption wrapper
     */
    @AuraEnabled(cacheable = true)
    public static List<Domain.PicklistOptionWrapper> getTemplateTypes() {
        List<Domain.PicklistOptionWrapper> poWrapperList = new List<Domain.PicklistOptionWrapper>();
        List<Document_Template__c> templates = new List<Document_Template__c>();
        templates = [SELECT Id, Template_Type__c 
                     FROM Document_Template__c WITH SECURITY_ENFORCED
                     LIMIT 49999];
        Set<String> templateTypes = new Set<String>();
        for(Document_Template__c template : templates) {
            if(String.isNotBlank(template.Template_Type__c)) {
                templateTypes.add(template.Template_Type__c);
            }
        }
        
        for(String templateType: templateTypes) {
            Domain.PicklistOptionWrapper optionWrapper = new Domain.PicklistOptionWrapper();
            optionWrapper.label = templateType;
            optionWrapper.value = templateType;
            poWrapperList.add(optionWrapper);
        }
        return poWrapperList;
    }
    
    /**
     * @description  :    Get picklist field label and value
     * @param        :    sObject objInfo, String picklistFieldApi
     * @return       :    List<Domain.PicklistOptionWrapper>
     */
    @AuraEnabled(cacheable = true)
    public static List<Domain.PicklistOptionWrapper> fetchPickListValue(sObject objInfo, String picklistFieldApi) {
        Schema.DescribeSObjectResult objDescribe = objInfo.getSObjectType().getDescribe();
        
        Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
        List<Schema.PicklistEntry > values = fieldMap.get(picklistFieldApi).getDescribe().getPickListValues();
        List<Domain.PicklistOptionWrapper> objWrapper = new List<Domain.PicklistOptionWrapper>();
        
        for(Schema.PicklistEntry a: values) {
            Domain.PicklistOptionWrapper optionWrapper = new Domain.PicklistOptionWrapper();
            optionWrapper.label = a.getLabel();
            optionWrapper.value = a.getValue();
            objWrapper.add(optionWrapper);
        }
        return objWrapper;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static String getTemplateError(String templateName,Id recordId)
    {
        String Error='';
        String sObjName = recordId.getSObjectType().getDescribe().getName();
        List<Document_Template__c> docTemplateListName = new List<Document_Template__c>();
        List<String> listOfTemplateNames = templateName.split(',');
        if (listOfTemplateNames != null && !listOfTemplateNames.isEmpty()) {
            docTemplateListName = [SELECT Id, Name, Template_Version__c ,Parent_Object_Name__c
                                                        FROM Document_Template__c
                                                        WHERE Name IN :listOfTemplateNames 
                                                        WITH SECURITY_ENFORCED];
        }

        if(docTemplateListName.size()>0) {

            if (string.isNotBlank(docTemplateListName[0].Parent_Object_Name__c) &&
                docTemplateListName[0].Parent_Object_Name__c!=sObjName)
            {
                Error='Object not matching' ;    
            }
        }

        return Error;
    }

    // make sure there is no leading/trailing space between words.

    private static List<String> trimListData(List<String> listData){
        List<String> finalList = new List<String>();
        for (String s : listData) {
            s = s.trim();
            finalList.add(s);
        }
        return finalList;
    }

    /**
     * @description  :    Queries the template by name and related record.
     * @param        :    String templateName, String relatedRecordId, String templateVersionNumber
     * @return       :    DocumentTemplate
     */
    @AuraEnabled(cacheable=true)
    public static List<DocumentTemplate> getTemplateByName(
        String templateName, 
        String relatedRecordId, 
        String templateVersionNumber) {
          List<String> templateList =templateName.split(',');
        List<String> listOfTemplateNames = new List<String>();
            for(String name :templateList ){
                listOfTemplateNames.add(name.trim());
            }
        for(Integer i = 0;i<listOfTemplateNames.size();i++){
            listOfTemplateNames[i] = listOfTemplateNames[i].contains('*') ? listOfTemplateNames[i].replace('*','%') : listOfTemplateNames[i] ;
        }
           
        List<Id> listOfDocTemplateIds = new List<Id>();
        List<DocumentTemplate> docTemplateWrapList = new List<DocumentTemplate>();
        List<Document_Template__c> docTemplateList = new List<Document_Template__c>();
        List<Document_Template__c> docTemplateListName = new List<Document_Template__c>();
        if (listOfTemplateNames != null && !listOfTemplateNames.isEmpty()) {
            //ABDS:removed version dependency below was in condition
            // AND (Template_Version__c = :templateVersionNumber) 
            /*docTemplateListName = [SELECT Id, Name, Template_Version__c 
                                                        FROM Document_Template__c
                                                        WHERE Name IN :listOfTemplateNames
                                                        WITH SECURITY_ENFORCED];*/
            
            docTemplateListName = [select Id, Name, Template_Version__c from 
                                   Document_Template__c Where 
                                   Name LIKE :listOfTemplateNames 
                                   WITH SECURITY_ENFORCED];
        }
        for (Document_Template__c docTemplate : docTemplateListName) {
            listOfDocTemplateIds.add(docTemplate.Id);
            
        }
        
        if (!listOfDocTemplateIds.isEmpty()) {
            docTemplateList =  [SELECT Id, Name, Template_Type__c, Template_Version__c, Is_Active__c,
                            (SELECT Id
                             FROM Corporate_Document__r
                             WHERE ownerId = :UserInfo.getuserid()
                             AND Related_Record__c = :relatedRecordId),
                            (SELECT Id
                             FROM TempContents__r)
                            FROM Document_Template__c 
                            WHERE Id IN :listOfDocTemplateIds
                            AND Is_Active__c = true WITH SECURITY_ENFORCED];
        }
        if(!docTemplateList.isEmpty()) {
            for (Document_Template__c docTemp : docTemplateList) {
                //Document_Template__c docTemplate = docTemp;
                DocumentTemplate docTemplateWrap = new DocumentTemplate();
                docTemplateWrap.id = docTemp.Id;
                docTemplateWrap.name = docTemp.Name;
                docTemplateWrap.templateType = docTemp.Template_Type__c;
                docTemplateWrap.templateVersion = docTemp.Template_Version__c;
                docTemplateWrap.isActive = docTemp.Is_Active__c;
                docTemplateWrap.isCorpDocListEmpty = docTemp.Corporate_Document__r.IsEmpty() ? true : false;
                docTemplateWrap.isSectionListEmpty = docTemp.TempContents__r.IsEmpty() ? true : false;
                docTemplateWrapList.add(docTemplateWrap);
            }
            
        }
        return docTemplateWrapList;
    }
    
    /**
     * @description  :    Queries the sObject based on record id.
     * @param        :    String currentrecordId, String objectApiName
     * @return       :    List<SObject> - list of sObject
     */
    @AuraEnabled(cacheable=true)
    public static List<SObject> getNameofRecord(String currentrecordId, String objectApiName) { 
        String escapedCurrentrecordId = String.escapeSingleQuotes(currentrecordId);
        String escapedObjectApiName = String.escapeSingleQuotes(objectApiName);
        SObject so = Schema.getGlobalDescribe().get(objectApiName).newSObject();
        if(so.getSobjectType().getDescribe().fields.getMap().containsKey('Name') == true) {
            List<SObject> record = Database.query(
                'SELECT Id, Name ' +
                ' FROM ' + escapedObjectApiName + 
                ' WHERE Id = :escapedCurrentrecordId WITH SECURITY_ENFORCED'
            );
            return record;
        } else {
            return Null;
        }
    }

    /**
     * @description  :    Calls the getHTML method of implementation class of DynamicContentGenerator
     * @param        :    Id recordId, String implementationClass, String customInput
     * @return       :    String - HTML markup
     */
    @AuraEnabled(cacheable=true)
    public static String getCustomMarkup(
            Id recordId, 
            String implementationClass,
            String customInput) {
        Type typeImpl = Type.forName(implementationClass);
        DynamicContentGenerator generator = (DynamicContentGenerator) typeImpl.newInstance();
        return generator.getHTML(recordId, customInput);
    }

    /**
     * @description  :    Calls the getJSON method of implementation class of DynamicContentGenerator
     * @param        :    Id recordId, String implementationClass, String customInput
     * @return       :    String - Placeholder and value in JSON format
     */
    @AuraEnabled(cacheable=true)
    public static String getCustomJSON(
            Id recordId, 
            String implementationClass,
            String customInput) {
        Type typeImpl = Type.forName(implementationClass);
        DynamicContentGenerator generator = (DynamicContentGenerator) typeImpl.newInstance();
        return generator.getJSON(recordId, customInput);
    }
    
    /**
     * @description  :    Queries documents by template id.
     * @param        :    Id formId
     * @return       :    String - Document Name
     */
    @AuraEnabled(cacheable=true)
    public static String getDocumentNameFromTemplateId(Id templateId) {
        Document_Template__c docTemplateRecord = [SELECT Id, Name 
                                                    FROM Document_Template__c
                                                    WHERE Id = :templateId
                                                    WITH SECURITY_ENFORCED];
        String documentNameToReturn = docTemplateRecord.Name;                                           
        if(docTemplateRecord.Name.containsIgnoreCase('template')) {
            documentNameToReturn = docTemplateRecord.Name.replace('template', '');
            documentNameToReturn = documentNameToReturn.replace('Template', '');
        }
        return documentNameToReturn;
    }
    
    public with sharing class DocumentTemplate {
        @AuraEnabled public Id id {get; set;}
        @AuraEnabled public String name {get; set;}
        @AuraEnabled public String templateType {get; set;}
        @AuraEnabled public String templateVersion {get; set;}
        @AuraEnabled public String department {get; set;}
        @AuraEnabled public String businessUnit {get; set;}
        @AuraEnabled public String description {get; set;}
        @AuraEnabled public Boolean isActive {get; set;}
        @AuraEnabled public Boolean isDefault {get; set;}
        @AuraEnabled public Boolean allowAttachAsPDF {get; set;}
        @AuraEnabled public Boolean allowSendAsEmailAttachment {get; set;}
        @AuraEnabled public Boolean allowEsign {get; set;}
        @AuraEnabled public String additionalInfoJSON {get; set;}
        @AuraEnabled public Boolean isCorpDocListEmpty {get; set;}
        @AuraEnabled public Boolean isSectionListEmpty {get; set;}
    }
    
    @AuraEnabled
    public static EmailWrapper composeEmailData(String recordId) {
        Id recId = recordId;
        String objectName = String.isBlank(recordId) ? '' : recId.getSObjectType().getDescribe().getName();
        List<String> listOfRefFields = new List<String>();
        List<String> listOfEmailTemplateName = new List<String>();
        List<String> listOfEmailsAddress = new List<String>();
        List<String> listOfFields = new List<String>();
        if(!Schema.sObjectType.EmailTemplate.fields.Name.isAccessible() ||
              !Schema.sObjectType.EmailTemplate.fields.Id.isAccessible() || 
              !Schema.sObjectType.EmailTemplate.fields.RelatedEntityType.isAccessible()){
                return null;
        }
        List<EmailTemplate> mailTemplateList = [SELECT Name, Id FROM EmailTemplate WHERE RelatedEntityType =: objectName and IsActive = true Order by Name LIMIT 99];      
        if(String.isBlank(objectName)){
            mailTemplateList = [SELECT Name, Id FROM EmailTemplate where IsActive = true order by Name LIMIT 99];      
        }
      
        for (EmailTemplate emailTemplateRecord : mailTemplateList) {
            listOfEmailTemplateName.add(emailTemplateRecord.Name);
        }
        if( !String.isBlank(recordId) ){
            Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            Map <String, Schema.SObjectField> fieldMap = schemaMap.get(objectName).getDescribe().fields.getMap();
            for(Schema.SObjectField sfield : fieldMap.Values())
            {
                schema.describefieldresult dfield = sfield.getDescribe();
                if (dfield.getType() ==  Schema.DisplayType.Email) {
                    listOfFields.add(dfield.getname());
                }
            }

            String queryString;
            //ABDS:s:e:Added if to check if there field list or not.

            if (listOfFields.size()>0)
            {
                queryString = 'SELECT Id, '+String.escapeSingleQuotes(String.join(listOfFields, ','))+ ' FROM '+String.escapeSingleQuotes(objectName)+' WHERE Id =: recordId';
            }
            else {
                queryString = 'SELECT Id FROM '+String.escapeSingleQuotes(objectName)+' WHERE Id =: recordId';
            }
            sObject objectData = Database.query(queryString);
            for (String emailField : listOfFields) {
                if (objectData.get(emailField) != null) {
                    listOfEmailsAddress.add(String.valueof(objectData.get(emailField)));
                }
            }
        }
        EmailWrapper wrap = new EmailWrapper();
        wrap.listOfToAddress = listOfEmailsAddress;
        wrap.listOfEmailTemplateNames = listOfEmailTemplateName;
        return wrap;
    }
    
    public class EmailWrapper{
        @AuraEnabled
        public List<String> listOfToAddress {get; set;}
        @AuraEnabled
        public List<String> listOfEmailTemplateNames {get; set;}
    }
    
    @AuraEnabled
    public static List<String> renderEmailBody(String emailTemplateName, String recordId) {
        List<String> listOfSubjBody = new List<String>();
        EmailTemplate emailTemplateRecord = [SELECT Name, Id, Subject, HtmlValue,RelatedEntityType FROM EmailTemplate WHERE Name =: emailTemplateName LIMIT 1];
        if(String.isBlank(recordId)){
            listOfSubjBody.add(emailTemplateRecord.Subject);
            listOfSubjBody.add(emailTemplateRecord.HtmlValue);
            return listOfSubjBody;
        }
        Id recId = recordId;
        String objName = recId.getSObjectType().getDescribe().getName();
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        if (objName == 'Lead' || objName == 'Contact' || objName == 'User') {
            email = Messaging.renderStoredEmailTemplate(emailTemplateRecord.Id, recordId, null);
        } else {
            email = Messaging.renderStoredEmailTemplate(emailTemplateRecord.Id, null, recordId);
        }
        listOfSubjBody.add(email.getSubject());
        listOfSubjBody.add(email.getHTMLBody());
        return listOfSubjBody;
    }
}