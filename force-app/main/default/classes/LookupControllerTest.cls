@isTest
public class LookupControllerTest {
    @isTest
    public static void testfindRecords() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> tempList = TestDataFactory.createTemplates(1, 'test template', ' ', true);
            List<Document_Content__c> sectionList = TestDataFactory.createSections(8, 'Section', tempList[0].Id, true);
            List<Document_Content__c> fieldList = TestDataFactory.createFields(1,'Field', sectionList, true);
            List<Document_Content__c> sectionLisToUpdate = new List<Document_Content__c>();
            Document_Content__c documentContent = fieldList[0];
            documentContent.Reference_Field__c = 'Contact.Birthdate';
            sectionLisToUpdate.add(documentContent);
            Document_Content__c docContent2 = sectionList[1];
            docContent2.Content_Type__c = 'Header';
            sectionLisToUpdate.add(docContent2);
            Document_Content__c docContent3 = sectionList[2];
            docContent3.Content_Type__c = 'Footer';
            sectionLisToUpdate.add(docContent3);
            Document_Content__c docContent4 = sectionList[3];
            docContent4.Content_Type__c = 'Related Records';
            sectionLisToUpdate.add(docContent4);
            UPDATE sectionLisToUpdate;
            fieldList.add(documentContent);
            String searchKey = 'Section';
            String objectName = 'Document_Content__c';
            List<Document_Content__c> retrunDocObj = LookupController.findRecords(searchKey, objectName);
            System.assert(retrunDocObj != Null);
        }
    }

    @isTest
    public static void testGetDocumentContentSectionWrapper() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> tempList = TestDataFactory.createTemplates(1, 'test template', ' ', true);
            List<Document_Content__c> sectionList = TestDataFactory.createSections(8, 'Section', tempList[0].Id, true);
            List<Document_Content__c> fieldList = TestDataFactory.createFields(1,'Field', sectionList, true);
            List<Document_Content__c> sectionLisToUpdate = new List<Document_Content__c>();
            Document_Content__c documentContent = fieldList[0];
            documentContent.Reference_Field__c = 'Contact.Birthdate';
            sectionLisToUpdate.add(documentContent);
            Document_Content__c docContent2 = sectionList[1];
            docContent2.Content_Type__c = 'Header';
            sectionLisToUpdate.add(docContent2);
            Document_Content__c docContent3 = sectionList[2];
            docContent2.Content_Type__c = 'Footer';
            sectionLisToUpdate.add(docContent3);
            Document_Content__c docContent4 = sectionList[3];
            docContent4.Content_Type__c = 'Related Records';
            sectionLisToUpdate.add(docContent4);
            UPDATE sectionLisToUpdate;
            fieldList.add(documentContent);
            Domain.SectionWrapper returnedSectionWrapper = LookupController.getDocumentContentSectionWrapper(sectionList[0].Id);
            Domain.SectionWrapper returnedSectionWrapper2 = LookupController.getDocumentContentSectionWrapper(sectionList[1].Id);
            Domain.SectionWrapper returnedSectionWrapper3 = LookupController.getDocumentContentSectionWrapper(docContent4.Id);
            System.assert(returnedSectionWrapper != Null);
            System.assert(returnedSectionWrapper2 != Null);
            System.assert(returnedSectionWrapper3 != Null);
        }
    }
    
   @isTest
    public static void testFetchSectionsAndTemplateDetails() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> tempList = TestDataFactory.createTemplates(1, 'test template', ' ', true);
            tempList[0].Parent_Object_Name__c = 'Account';
            update tempList[0];
            List<Document_Content__c> sectionList = TestDataFactory.createSections(8, 'Section', tempList[0].Id, true);
            List<Document_Content__c> fieldList = TestDataFactory.createFields(1,'Field', sectionList, true);
            List<Document_Content__c> sectionLisToUpdate = new List<Document_Content__c>();
            Document_Content__c documentContent = fieldList[0];
            documentContent.Reference_Field__c = 'Contact.Birthdate';
            sectionLisToUpdate.add(documentContent);
            Document_Content__c docContent2 = sectionList[1];
            docContent2.Content_Type__c = 'Header';
            sectionLisToUpdate.add(docContent2);
            Document_Content__c docContent3 = sectionList[2];
            docContent2.Content_Type__c = 'Footer';
            sectionLisToUpdate.add(docContent3);
            Document_Content__c docContent4 = sectionList[3];
            docContent4.Content_Type__c = 'Related Records';
            sectionLisToUpdate.add(docContent4);
            UPDATE sectionLisToUpdate;
            fieldList.add(documentContent);
            Test.startTest();
            List<Document_Content__c> retrunDocObj = LookupController.fetchSectionsAndTemplateDetails('Section','Account');
            System.assert(retrunDocObj != Null);
            Test.stopTest();
        }
    }
}