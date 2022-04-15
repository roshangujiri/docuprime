@isTest
private class FormHandlerTest {
    @isTest
    static void testGetFormList() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(4, 'Demo Template', '', true);
            String fieldName = Schema.SObjectType.Document_Template__c.fields.Template_Type__c.getName();
            String type = TestDataFactory.getPicklistValue(SObjectType.Document_Template__c, fieldName, 0);
            List<FormHandler.DocumentTemplate> templateWrapList = FormHandler.getFormList(type);
            System.assertEquals(templateWrapList.size(), 4);
            System.assertEquals(templateWrapList[0].isSectionListEmpty, true);
        }
    }
    
    @isTest
     static void testGetTemplateById() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);
            List<Contact> contactList = TestDataFactory.createContactsWithAccount(1, 'Test Contact',accList[0].Id, true);
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(4, 'Demo Template', '', true);
            FormHandler.DocumentTemplate templateWrap = FormHandler.getTemplateById(templateList[0].Id, contactList[0].Id);
            System.assertEquals(templateWrap.id, templateList[0].Id);
            System.assertEquals(templateWrap.name, templateList[0].Name);
        }
    }
    
    @isTest
    static void testGetDocumentTemplate() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(4, 'Demo Template', '', true);
            FormHandler.DocumentTemplate templateWrap = FormHandler.getDocumentTemplate(templateList[0].Id);
            System.assertEquals(templateWrap.name, 'Demo Template0');
        }
    }
    
    @isTest
     static void testUpsertDocContentList() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Document_Content__c> sectionList = TestDataFactory.createSections(2, 'Section', templateList[0].Id, false);
            FormHandler.upsertDocContentList(sectionList);
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            newSectionList = [SELECT Id, Name FROM Document_Content__c];
            System.assertEquals(newSectionList.size(), 2);
        }
    }
    
    @isTest
    static void testDeleteDocument() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            
            List<Document_Content__c> sectionList = new List<Document_Content__c>();
            sectionList = [SELECT Id FROM Document_Content__c WHERE Corporate_Document__c = :docList[0].Id];
            System.assertEquals(2, sectionList.size());
            
            FormHandler.deleteDocument(docList[0].Id);
            
            List<Corporate_Document__c> newDocList = new List<Corporate_Document__c>();
            newDocList = [SELECT Id FROM Corporate_Document__c WHERE Id = :docList[0].Id];
            System.assertEquals(0, newDocList.size());
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            sectionList = [SELECT Id FROM Document_Content__c WHERE Corporate_Document__c = :docList[0].Id];
            System.assertEquals(0, sectionList.size());
        }
    }
    
    @isTest
    static void testGetFormContentList() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Document_Content__c> sectionList = TestDataFactory.createSections(2, 'Section', templateList[0].Id, true);
            List<Document_Content__c> fieldList = TestDataFactory.createFields(5,'Field', sectionList, true);
            List<Domain.SectionWrapper> newSectionList = FormHandler.getFormContentList(templateList[0].Id);
            System.assertEquals(newSectionList.size(), 2);
            System.assertEquals(newSectionList[0].fields.size(), 3);
        }
    }
    
    @isTest
    static void testGetDocumentList() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);
            List<Contact> contactList = TestDataFactory.createContactsWithAccount(1, 'Test Contact',accList[0].Id, true);
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(2, '', templateList[0].Id, true);
            String relatedRecordId = String.valueOf(contactList[0].Id);
            docList[0].Related_Record__c = relatedRecordId;
            docList[1].Related_Record__c = relatedRecordId;
            UPDATE docList;
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[1].Id, true);
            PagedResult newDocList = FormHandler.getDocumentList(templateList[0].Id, relatedRecordId, 1, 10);
            System.assertEquals(newDocList.records.size(), 2);
        }
    }
    
    @isTest
    static void testGetDocumentById() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(2, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[1].Id, true);
            Domain.DocumentWrapper newDoc = FormHandler.getDocumentById(docList[0].Id);
            System.assertEquals(newDoc.id, docList[0].Id);
        }
    }
    
    @isTest
    static void testGetDocumentByCurrentUserId() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(2, '', templateList[0].Id, true);
            List<Corporate_Document__c> newDocList = FormHandler.getDocumentByCurrentUserId(templateList[0].Id);
            System.assertEquals(newDocList.size(), 2);
        } 
    }
    
    @isTest
    static void testGetTemplateTypes() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(4, 'Demo Template', '', true);
            List<Domain.PicklistOptionWrapper> poWrapperList = FormHandler.getTemplateTypes();
            System.assertEquals(poWrapperList.size(), 1);
        }
    }
    
    @isTest
    static void testGetRecordCount() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(2, '', templateList[0].Id, true);
            System.assertEquals(FormHandler.getRecordCount(templateList[0].Id), 2);
        } 
    }
    
    @isTest
    static void testGetNameofRecord() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true); 
            List<Sobject> sobjectList = FormHandler.getNameofRecord(accList[0].Id, 'Account');
            System.assertEquals(sobjectList.size(), 1);
        }
    }

    @isTest
    static void testGetTemplateByName() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);
            List<Contact> contactList = TestDataFactory.createContactsWithAccount(1, 'Test Contact',accList[0].Id, true);
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(4, 'Demo Template', '', true);
            List<FormHandler.DocumentTemplate> templateWrap = FormHandler.getTemplateByName(templateList[0].Name, contactList[0].Id,'V1'); 
            System.assertEquals(templateWrap[0].id, templateList[0].Id);
            System.assertEquals(templateWrap[0].name, templateList[0].Name);
        }
    }
    
    @isTest
    static void testgetTemplateError() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            Document_Template__c DT= new Document_Template__c();
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            string RetString =FormHandler.getTemplateError('Demo Template',templateList[0].Id);
            System.assertEquals(true, RetString == '');
        }
    }
    
     @isTest
    static void testgetDocumentNameFromTemplateId() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            Document_Template__c DT= new Document_Template__c();
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            string RetString =FormHandler.getDocumentNameFromTemplateId( templateList[0].Id);
            System.assertEquals(false, RetString == '');
        }
    }
    
    @isTest
    public static void testcomposeEmailData() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            Document_Template__c DT= new Document_Template__c();
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            FormHandler.EmailWrapper retFormHandler=FormHandler.composeEmailData( templateList[0].Id);
            System.assertEquals(false,retFormHandler.listOfToAddress.size()==1 );
        }
    }
    
    @isTest
     static void testFetchPickListValue() {
         List<Domain.PicklistOptionWrapper> result = FormHandler.fetchPickListValue(new Account(),'Rating');
        //System.assertEquals(true,FormHandler.fetchPickListValue.size()==1 );
		//System.assertEquals(Account.Id, fetchPickListValue.Id);
		//System.debug('result value:'+result);
		
        System.assert(!result.isEmpty());
        
    }
	
@isTest
    static void testRenderEmailBody() {
        EmailTemplate e = new EmailTemplate (developerName = 'test',FolderId = UserInfo.getUserId(), TemplateType= 'Text', Name = 'test');
		insert e;
        System.RunAs(new User(Id = UserInfo.getUserId())){
        	List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);
        	List<Contact> conList = TestDataFactory.createContactsWithAccount(1, 'Test Contact', accList[0].Id, true);
        	List<String> result = FormHandler.renderEmailBody(e.Name, conList[0].Id);
			//system.debug('result:'+result);
			System.assert(!result.isEmpty()); 
			//System.assertEquals(e.Name, conList[0].Id);  
        }
    }
    
    
}