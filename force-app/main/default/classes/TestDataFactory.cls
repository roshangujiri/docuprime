@isTest
public class TestDataFactory {
    public static List<Document_Template__c> createTemplates(Integer count, String name, String type, Boolean doInsert) {
        List<Document_Template__c> templateList = new List<Document_Template__c>();
        if(String.isBlank(type)) {
            String fieldName = Schema.SObjectType.Document_Template__c.fields.Template_Type__c.getName();
            type = getPicklistValue(SObjectType.Document_Template__c, fieldName, 0);
        }
        for(Integer i = 0; i< count; i++) {
            Document_Template__c template = new Document_Template__c();
            template.Name = name + i;
			template.Template_Version__c = 'V1';
            template.Template_Type__c = type;
            template.Is_Active__c = true;
            templateList.add(template);
        }
        if(doInsert) {
            INSERT templateList;
        }
        return templateList;
    }
    public static List<Document_Template__c> createDefaultTemplates(Integer count, String name, String type, Boolean doInsert) {
      List<Document_Template__c> templateList = new List<Document_Template__c>();
      if(String.isBlank(type)) {
          String fieldName = Schema.SObjectType.Document_Template__c.fields.Template_Type__c.getName();
          type = getPicklistValue(SObjectType.Document_Template__c, fieldName, 0);
      }
      for(Integer i = 0; i< count; i++) {
          Document_Template__c template = new Document_Template__c();
          template.Name = name + i;
    template.Template_Version__c = '1.0';
          template.Template_Type__c = type;
          template.Is_Active__c = true;
          template.Is_Default__c = true;
          //template.Parent_Template__c = createTemplates(1,'Parent Test','Regulatory',true)[0].id;
          templateList.add(template);
      }
      if(doInsert) {
          INSERT templateList;
      }
      return templateList;
  }
    public static List<Corporate_Document__c> createDocuments(Integer count, String stage, Id templateId, Boolean doInsert) {
      List<Corporate_Document__c> docList = new List<Corporate_Document__c>();
      if(String.isBlank(stage)) {
        String fieldName = Schema.SObjectType.Corporate_Document__c.fields.Document_Stage__c.getName();
        stage = getPicklistValue(SObjectType.Corporate_Document__c, fieldName, 0);
      }
      for(Integer i = 0; i< count; i++) {
        Corporate_Document__c doc = new Corporate_Document__c();
        doc.Document_Stage__c = stage;
        doc.Document_Template__c = templateId;
        docList.add(doc);
      }
      if(doInsert) {
          INSERT docList;
      }
      return docList;
  }

    public static List<Document_Content__c> createSections(Integer count, 
                                                            String name, 
                                                            Id templateId, 
                                                            Boolean doInsert) {
      List<Document_Content__c> sectionList = new List<Document_Content__c>();
      for(Integer i = 0; i< count; i++) {
        Document_Content__c section = new Document_Content__c();
        section.Name = name +'-'+ i;
        section.Order_Sequence__c = i + 1;
        section.Section_Content__c = '<p style=\"text-align: center;\"><b><i>TEST CONTENT [Field-0] </i></b></p>';
        section.Document_Template__c = templateId;
        section.Visibility__c = 'All The Pages'; 
        section.Alignment__c = 'Center';
        sectionList.add(section);
      }
      if(doInsert) {
        INSERT sectionList;
      }
      return sectionList;
    }

    public static List<Document_Content__c> createSectionsForDocument(Integer count, 
                                                            String name, 
                                                            Id documentId, 
                                                            Boolean doInsert) {
      List<Document_Content__c> sectionList = new List<Document_Content__c>();
      for(Integer i = 0; i< count; i++) {
        Document_Content__c section = new Document_Content__c();
        section.Name = name +'-'+ i;
        section.Order_Sequence__c = i + 1;
        section.Section_Content__c = '<p style=\"text-align: center;\"><b><i>TEST CONTENT</i></b></p>';
        section.Corporate_Document__c = documentId;
        sectionList.add(section);
      }
      if(doInsert) {
        INSERT sectionList;
      }
      return sectionList;
    }

    public static List<Document_Content__c> createFields(Integer count, 
                                                          String name, 
                                                          List<Document_Content__c> sectionList, 
                                                          Boolean doInsert) {
      List<Document_Content__c> fieldList = new List<Document_Content__c>();
      String fieldName = Schema.SObjectType.Document_Content__c.fields.Field_Type__c.getName();
      String fieldType = getPicklistValue(SObjectType.Document_Content__c, fieldName, 0);
      Integer sectionCount = 0;
      for(Integer i = 0; i< count; i++) {
        Document_Content__c field = new Document_Content__c();
        field.Name = name +'-'+ i;
        field.Order_Sequence__c = i + 1;
        field.Content__c = sectionList[sectionCount].Id;
        field.Field_Type__c = fieldType;
        field.Placeholder_Content__c = field.Name;
        field.Reference_Field__c = 'Account.Name'; 
        field.Visibility__c = 'All The Pages'; 
        fieldList.add(field);
        sectionCount++;
        if(sectionCount == sectionList.size()) {
          sectionCount = 0;
        }
      }
      if(doInsert) {
        INSERT fieldList;
      }
      return fieldList;
    }

    public static List<Domain.SectionWrapper> createSectionWrapsWithFieldWraps(Integer numSecWrap, Integer numFieldWrapsPerSecWrap) {
      List<Domain.SectionWrapper> secWrapList = new List<Domain.SectionWrapper>();
      List<Domain.FieldWrapper> fieldWrapList = new List<Domain.FieldWrapper>();
      String fieldName = Schema.SObjectType.Document_Content__c.fields.Field_Type__c.getName();
      String fieldType = getPicklistValue(SObjectType.Document_Content__c, fieldName, 0);
      for(Integer i = 0; i < numSecWrap; i++) {
        Domain.SectionWrapper secWrap = new Domain.SectionWrapper();
        secWrap.key = 'Section-' + i;
        secWrap.name = 'Section ' + i;
        secWrap.orderSequence = i + 1;
        secWrap.isLandscapeLayout = false;
        secWrap.content = '<p style=\"text-align: center;\"><b><i>TEST CONTENT</i></b></p>';
        fieldWrapList = new List<Domain.FieldWrapper>();
        for(Integer k = 0; k < numFieldWrapsPerSecWrap; k++) {
          Domain.FieldWrapper fieldWrap = new Domain.FieldWrapper();
          fieldWrap.key = secWrap.key + k + 1;
          fieldWrap.sectionKey = secWrap.key;
          fieldWrap.name = 'Field ' + i;
          fieldWrap.type = fieldType;
          fieldWrap.orderSequence = k + 1;
          fieldWrap.placeholderContent = 'Field ' + i;
          fieldWrapList.add(fieldWrap);
        }
        secWrap.fields = fieldWrapList;
        secWrapList.add(secWrap);
      }
      return secWrapList;
  }
    
    public static String getPicklistValue(DescribeSObjectResult objInfo, 
                                          String picklistFieldApiname, 
                                          Integer index) {
        Map<String, Schema.SObjectField> fieldMap = objInfo.fields.getMap();
        List<Schema.PicklistEntry > availableValues = fieldMap.get(picklistFieldApiname).getDescribe().getPickListValues();
        return availableValues[index].getValue();
    }
    
    public static List<Account> createAccounts(Integer count, String name, Boolean doInsert) {
        List<Account> accList = new List<Account>();
        for(Integer i = 0; i< count; i++) {
            Account a = new Account(name = name + i, NumberOfEmployees=100);
            accList.add(a);
        }
        if(doInsert) {
            INSERT accList;
        }
        return accList;
    }
    
    public static List<Contact> createContactsWithAccount(Integer count, String name, Id accId, Boolean doInsert) {
        List<Contact> contactList = new List<Contact>();
        for(Integer i = 0; i< count; i++) {
            Contact con = new Contact(LastName = name + i, Title=name + i, AccountId = accId);
            contactList.add(con);
        }
        if(doInsert) {
            INSERT contactList;
        }
        return contactList;
    }
    
    public static App_Settings__c createCustomSetting() {
        App_Settings__c AppSetting = new App_Settings__c();
        AppSetting.RestAPIVersion__c='v53.0';
        AppSetting.Named_Cred__c='ToolingRest';
        AppSetting.Use_Named_Cred__c=true;
        INSERT AppSetting;
        
        return AppSetting;
    }
}