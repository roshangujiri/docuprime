/**
 * @name         :    LookupController
 * @description  :    Used for the lookup search component(customLookupSearch) to get the 
 *                    Document_Content__c and return sectionwrapper user selected section
 */
public with sharing class LookupController {
    /**
    * @description    :    Fetch Document content sections matching with user input search keyword
    * @param          :    String searchKey, String objectName(Document_Content__c)
    * @return         :    Returns List of Document_Content__c (sections)
    */
    @AuraEnabled(cacheable=true) 
    public static List<Document_Content__c> findRecords(String searchKey, String objectName) {
        Map<Id, Document_Content__c> documentContentBodySection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentHeaderSection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentFooterSection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentRelatedRecordSection = new Map<id, Document_Content__c>();
        Set<Document_Content__c> documentContentBodySectionAfterFilter = new Set<Document_Content__c>();
        List<Document_Content__c> documentContentBodySectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentHeaderSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentFooterSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentRelatedRecordSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentFinalListAfterFiltering = new List<Document_Content__c>();
        String searchText = '%' + searchKey + '%'; 
        String query = 'SELECT Id, Name FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' WITH SECURITY_ENFORCED LIMIT 6'; 
        List<Document_Content__c> documentContentList = Database.query(
            'SELECT Id, Name, Content_Type__c ' +
            ' FROM Document_Content__c ' +
            ' WHERE Content__c = Null ' +
            ' AND Name LIKE:searchText WITH SECURITY_ENFORCED LIMIT 49999'
//+ String.escapeSingleQuotes(searchText) +
            
        ); 
        for(Document_Content__c docContentObj : documentContentList) {
            if(docContentObj.Content_Type__c == 'Body') {
                documentContentBodySection.put(docContentObj.Id, docContentObj);
            } else if(docContentObj.Content_Type__c == 'Header') {
                documentContentHeaderSection.put(docContentObj.Id, docContentObj);
            } else if(docContentObj.Content_Type__c == 'Footer') {
                documentContentFooterSection.put(docContentObj.Id, docContentObj);
            } else if(docContentObj.Content_Type__c == 'Related Records') {
                documentContentRelatedRecordSection.put(docContentObj.Id, docContentObj);
            }
        }
        // Filtering Document Section Body Records
        if(documentContentBodySection != Null) {
            List<Document_Content__c> documentContentBodySectionBeforeFiltering = documentContentBodySection.values();
            Set<String> documentContentBodyNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentBodySectionBeforeFiltering) {
                if(i==0) {
                    documentContentBodyNameSet.add(docContentObj.Name);
                    documentContentBodySectionAfterFiltering.add(docContentObj);
                    i++;
                }
                if(documentContentBodyNameSet.Size() != 0 && !documentContentBodyNameSet.contains(docContentObj.Name)) {
                    documentContentBodyNameSet.add(docContentObj.Name);
                    documentContentBodySectionAfterFiltering.add(docContentObj);
                }
            }
            Set<Id> documentContentBodySectionIds = documentContentBodySection.keySet();
            List<Document_Content__c> documentContentBodySectionWithFields =  [SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c,
                                                                                Query_JSON__c, Visibility__c, Alignment__c, Enable_Landscape_Layout__c,
                                                                                (SELECT Id, Name, Content__c, Order_Sequence__c, Field_Type__c, 
                                                                                    Placeholder_Content__c, Picklist_Values__c, Reference_Field__c
                                                                                  FROM Contents__r 
                                                                                  ORDER BY Order_Sequence__c 
                                                                                  ASC NULLS LAST) 
                                                                               FROM Document_Content__c 
                                                                               WHERE Id = :documentContentBodySectionIds 
                                                                               WITH SECURITY_ENFORCED ORDER BY Order_Sequence__c 
                                                                               ASC NULLS LAST];
        }
        // Filtering Document Section Header Records
        if(documentContentHeaderSection != Null) {
            List<Document_Content__c> documentContentHeaderSectionBeforeFiltering = documentContentHeaderSection.values();
            Set<String> documentContentHeaderSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentHeaderSectionBeforeFiltering) {
                if(i == 0) {
                    documentContentHeaderSectionNameSet.add(docContentObj.Name);
                    documentContentHeaderSectionAfterFiltering.add(docContentObj);
                    i++;
                }
                if(documentContentHeaderSectionNameSet.Size() != 0 && !documentContentHeaderSectionNameSet.contains(docContentObj.Name)) {
                    documentContentHeaderSectionNameSet.add(docContentObj.Name);
                    documentContentHeaderSectionAfterFiltering.add(docContentObj);
                }
            }
        }
        // Filtering Document Section Footer Records
        if(documentContentFooterSection != Null) {
            List<Document_Content__c> documentContentFooterSectionBeforeFiltering = documentContentFooterSection.values();
            Set<String> documentContentFooterSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentFooterSectionBeforeFiltering) {
                if(i==0) {
                    documentContentFooterSectionNameSet.add(docContentObj.Name);
                    documentContentFooterSectionAfterFiltering.add(docContentObj);
                    i++;
                }
                if(documentContentFooterSectionNameSet.Size() != 0 && !documentContentFooterSectionNameSet.contains(docContentObj.Name)) {
                    documentContentFooterSectionNameSet.add(docContentObj.Name);
                    documentContentFooterSectionAfterFiltering.add(docContentObj);
                }
            }
        }
        // Filtering Document Section Related Records - Records
        if(documentContentRelatedRecordSection != Null) {
            List<Document_Content__c> documentContentRelatedRecordSectionBeforeFiltering = documentContentRelatedRecordSection.values();
            Set<String> documentContentRelatedRecordSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentRelatedRecordSectionBeforeFiltering) {
                if(i==0) {
                    documentContentRelatedRecordSectionNameSet.add(docContentObj.Name);
                    documentContentRelatedRecordSectionAfterFiltering.add(docContentObj);
                    i++;
                }
                if(documentContentRelatedRecordSectionNameSet.Size() != 0 && !documentContentRelatedRecordSectionNameSet.contains(docContentObj.Name)) {
                    documentContentRelatedRecordSectionNameSet.add(docContentObj.Name);
                    documentContentRelatedRecordSectionAfterFiltering.add(docContentObj);
                }
            }
        }
        // Adding Document content (Body, Header, Footer, Related Records) to Final List Ater Filtering -documentContentFinalListAfterFiltering
        // Adding records type - body to the final List 
        for(Document_Content__c docContentObj : documentContentBodySectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - Header to the final List 
        for(Document_Content__c docContentObj : documentContentHeaderSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - Footer to the final List 
        for(Document_Content__c docContentObj : documentContentFooterSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - RelatedRecord to the final List 
        for(Document_Content__c docContentObj : documentContentRelatedRecordSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // return documentContentList;
        return documentContentFinalListAfterFiltering;
    }

    /**
    * @description    :    Create and return SectionWrapper user selected Document Content
    * @param          :    Id DocumentContentId 
    * @return         :    Returns SectionWrapper of Document_Content__c (sections)
    */ 
    @AuraEnabled(cacheable=true)
    public static Domain.SectionWrapper getDocumentContentSectionWrapper(Id DocumentContentId) {
        Domain.SectionWrapper sectionWrapperObj = new Domain.SectionWrapper();
        List<Domain.FieldWrapper> fieldWrapperList = new List<Domain.FieldWrapper>();
        List<Document_Content__c> sectionList = [SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c,
                                                Query_JSON__c, Visibility__c, Alignment__c, Enable_Landscape_Layout__c, 
                                                    (SELECT Id, Name, Content__c, Order_Sequence__c, Field_Type__c, Placeholder_Content__c, 
                                                    Picklist_Values__c, Reference_Field__c
                                                    FROM Contents__r 
                                                    ORDER BY Order_Sequence__c 
                                                    ASC NULLS LAST) 
                                                FROM Document_Content__c 
                                                WHERE Id = :DocumentContentId 
                                                WITH SECURITY_ENFORCED ORDER BY Order_Sequence__c 
                                                ASC NULLS LAST];
        Integer i = 0;
        for(Document_Content__c section : sectionList) {
            sectionWrapperObj.id = '';
            sectionWrapperObj.key = '';
            sectionWrapperObj.name = section.name;
            sectionWrapperObj.contentType = section.Content_Type__c;
            sectionWrapperObj.isLandscapeLayout = section.Enable_Landscape_Layout__c;
            if(section.Content_Type__c == 'Body') {
                sectionWrapperObj.isBlankPage = false;
                sectionWrapperObj.isBodyContent = true;
                sectionWrapperObj.isPageBreak = false;
                sectionWrapperObj.isPageBreakOrBlankPage = false;
                sectionWrapperObj.isRelatedRecords = false;
            }
            if(section.Content_Type__c == 'Related Records') {
                sectionWrapperObj.isBlankPage = false;
                sectionWrapperObj.isBodyContent = true;
                sectionWrapperObj.isPageBreak = false;
                sectionWrapperObj.isPageBreakOrBlankPage = false;
                sectionWrapperObj.isRelatedRecords = true;
                sectionWrapperObj.queryJSON = section.Query_JSON__c;
            } 
            if(section.Content_Type__c == 'Header' || section.Content_Type__c == 'Footer') {
                sectionWrapperObj.isBlankPage = false;
                sectionWrapperObj.isBodyContent = false;
                sectionWrapperObj.isPageBreak = false;
                sectionWrapperObj.isPageBreakOrBlankPage = false;
                sectionWrapperObj.isRelatedRecords = false;
                sectionWrapperObj.visibility = section.Visibility__c;
                sectionWrapperObj.alignment = section.Alignment__c;
            }
            sectionWrapperObj.orderSequence = 0; 
            sectionWrapperObj.content = section.Section_Content__c;
            for(Document_Content__c field : section.Contents__r) {
                i++;
                Domain.FieldWrapper fieldWrap = new Domain.FieldWrapper();
                fieldWrap.id = '';
                fieldWrap.name = field.Name;
                fieldWrap.type = field.Field_Type__c;
                fieldWrap.isPicklist = false;
                fieldWrap.orderSequence = i;
                fieldWrap.placeholderContent = field.Placeholder_Content__c;
                fieldWrap.referenceField = field.Reference_Field__c;
                fieldWrap.picklistValues = field.Picklist_Values__c;
                fieldWrap.key = '';
                fieldWrap.sectionKey = '';
                fieldWrapperList.add(fieldWrap);
            }  
        }
        sectionWrapperObj.fields = fieldWrapperList;
        return sectionWrapperObj;
    }

      /**
    * @description    :    Fetch Document content sections matching with user input search keyword and parent object
    * @param          :    String searchKey, String objectName(Document_Template__c.Parent_Object_Name__c)
    * @return         :    Returns List of Document_Content__c (sections)
    */
    @AuraEnabled(cacheable=true) 
    public static List<Document_Content__c> fetchSectionsAndTemplateDetails(String searchKey, String objectName) {
        Map<Id, Document_Content__c> documentContentBodySection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentHeaderSection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentFooterSection = new Map<id, Document_Content__c>();
        Map<Id, Document_Content__c> documentContentRelatedRecordSection = new Map<id, Document_Content__c>();
        Set<Document_Content__c> documentContentBodySectionAfterFilter = new Set<Document_Content__c>();
        List<Document_Content__c> documentContentBodySectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentHeaderSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentFooterSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentRelatedRecordSectionAfterFiltering = new List<Document_Content__c>();
        List<Document_Content__c> documentContentFinalListAfterFiltering = new List<Document_Content__c>();
        String searchText = '%' + searchKey + '%'; 
        System.debug('searchkey:'+searchText);
        System.debug('objectName:'+objectName);
        List<Document_Content__c> documentContentList = Database.query(
            'SELECT Id, Name, Content_Type__c, Document_Template__r.Name,Document_Template__r.Template_Version__c ' +
            ' FROM Document_Content__c ' +
            ' WHERE Content__c = Null ' +
            ' AND Name LIKE:searchText ' +
            ' AND Document_Template__r.Parent_Object_Name__c=\''+String.escapeSingleQuotes(objectName)+'\''+
            ' WITH SECURITY_ENFORCED LIMIT 49999'
        ); 
        //SELECT Id, Name, docupad__Content_Type__c, docupad__Document_Template__r.Name,docupad__Document_Template__r.docupad__Template_Version__c FROM docupad__Document_Content__c
        /*List<Document_Content__c> documentContentList = Database.query(
            'SELECT Id, Name, docupad__Content_Type__c, docupad__Document_Template__r.Name,docupad__Document_Template__r.docupad__Template_Version__c ' +
            ' FROM docupad__Document_Content__c ' +
            ' WHERE docupad__Content__c = Null ' +
            ' AND Name LIKE:searchText ' +
            ' AND docupad__Document_Template__r.docupad__Parent_Object_Name__c=\''+String.escapeSingleQuotes(objectName)+'\''+
            ' WITH SECURITY_ENFORCED LIMIT 49999'
        );*/ 
        //System.debug('Document_Template__r:'+documentContentList);
        
        for(Document_Content__c docContentObj : documentContentList) {
            if(docContentObj.Content_Type__c == 'Body') {
                documentContentBodySection.put(docContentObj.Id, docContentObj); 
            } else if(docContentObj.Content_Type__c == 'Header') {
                documentContentHeaderSection.put(docContentObj.Id, docContentObj);
            } else if(docContentObj.Content_Type__c == 'Footer') {
                documentContentFooterSection.put(docContentObj.Id, docContentObj);
            } else if(docContentObj.Content_Type__c == 'Related Records') {
                documentContentRelatedRecordSection.put(docContentObj.Id, docContentObj);
            }
        }       
        // Filtering Document Section Body Records
        if(documentContentBodySection != Null) {
            List<Document_Content__c> documentContentBodySectionBeforeFiltering = documentContentBodySection.values();
            Set<String> documentContentBodyNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentBodySectionBeforeFiltering) {
                documentContentBodyNameSet.add(docContentObj.Name);
                documentContentBodySectionAfterFiltering.add(docContentObj);
                i++;
            }            
            Set<Id> documentContentBodySectionIds = documentContentBodySection.keySet();
            List<Document_Content__c> documentContentBodySectionWithFields =  [SELECT Id, Name, Section_Content__c, Order_Sequence__c, Content_Type__c,
                                                                                Query_JSON__c, Visibility__c, Alignment__c, Enable_Landscape_Layout__c,
                                                                                (SELECT Id, Name, Content__c, Order_Sequence__c, Field_Type__c, 
                                                                                    Placeholder_Content__c, Picklist_Values__c, Reference_Field__c
                                                                                  FROM Contents__r 
                                                                                  ORDER BY Order_Sequence__c 
                                                                                  ASC NULLS LAST) 
                                                                               FROM Document_Content__c 
                                                                               WHERE Id = :documentContentBodySectionIds 
                                                                               WITH SECURITY_ENFORCED ORDER BY Order_Sequence__c 
                                                                               ASC NULLS LAST];
        }
        
        // Filtering Document Section Header Records
        if(documentContentHeaderSection != Null) {
            List<Document_Content__c> documentContentHeaderSectionBeforeFiltering = documentContentHeaderSection.values();
            Set<String> documentContentHeaderSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentHeaderSectionBeforeFiltering) {
                documentContentHeaderSectionNameSet.add(docContentObj.Name);
                documentContentHeaderSectionAfterFiltering.add(docContentObj);
                i++;
            }
        }
        // Filtering Document Section Footer Records
        if(documentContentFooterSection != Null) {
            List<Document_Content__c> documentContentFooterSectionBeforeFiltering = documentContentFooterSection.values();
            Set<String> documentContentFooterSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentFooterSectionBeforeFiltering) {
              
                    documentContentFooterSectionNameSet.add(docContentObj.Name);
                    documentContentFooterSectionAfterFiltering.add(docContentObj);
                    i++;
            }
        }
        // Filtering Document Section Related Records - Records
        if(documentContentRelatedRecordSection != Null) {
            List<Document_Content__c> documentContentRelatedRecordSectionBeforeFiltering = documentContentRelatedRecordSection.values();
            Set<String> documentContentRelatedRecordSectionNameSet = new Set<String>();
            Integer i = 0;
            for(Document_Content__c docContentObj : documentContentRelatedRecordSectionBeforeFiltering) {    
                documentContentRelatedRecordSectionNameSet.add(docContentObj.Name);
                documentContentRelatedRecordSectionAfterFiltering.add(docContentObj);
                i++;              
            }
        }
        // Adding Document content (Body, Header, Footer, Related Records) to Final List Ater Filtering -documentContentFinalListAfterFiltering
        // Adding records type - body to the final List 
        for(Document_Content__c docContentObj : documentContentBodySectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - Header to the final List 
        for(Document_Content__c docContentObj : documentContentHeaderSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - Footer to the final List 
        for(Document_Content__c docContentObj : documentContentFooterSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }
        // Adding records type - RelatedRecord to the final List 
        for(Document_Content__c docContentObj : documentContentRelatedRecordSectionAfterFiltering) {
            documentContentFinalListAfterFiltering.add(docContentObj);
        }

        //System.debug('Document_filtering:'+documentContentFinalListAfterFiltering);      
        return documentContentFinalListAfterFiltering;
        
    }
}