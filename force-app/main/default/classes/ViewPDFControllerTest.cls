@isTest
public class ViewPDFControllerTest {
    @isTest
    public static void testLoadPageContents() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            Test.setCurrentPageReference(new PageReference('Page.ViewPDF'));
            System.currentPageReference().getParameters().put('id', docList[0].Id);
            ViewPDFController.loadPageContents();
            
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            newSectionList = [SELECT Id, Name FROM Document_Content__c WHERE Corporate_Document__c = :docList[0].Id];
            System.assertEquals(2, newSectionList.size());
        }
    }
    
    @isTest
    public static void testLoadPageContentsWithHeader() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            List<Document_Content__c> sectionList = TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            sectionList[0].Content_Type__c = 'Header';
            sectionList[0].Visibility__c = 'All The Pages';
            sectionList[0].Alignment__c = 'Center';
            UPDATE sectionList;
            Test.setCurrentPageReference(new PageReference('Page.ViewPDF'));
            System.currentPageReference().getParameters().put('id', docList[0].Id);
            ViewPDFController.loadPageContents();
            
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            newSectionList = [SELECT Id, Name FROM Document_Content__c WHERE Corporate_Document__c = :docList[0].Id];
            System.assertEquals(2, newSectionList.size());
        }
    }
   @isTest
    public static void testLoadPageContentsWithPageBreak() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
             List<Document_Content__c> sectionList = TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            sectionList[0].Content_Type__c = 'Page Break';
            sectionList[0].Visibility__c = 'All The Pages';
            sectionList[0].Alignment__c = 'Center';
            UPDATE sectionList;
            Test.setCurrentPageReference(new PageReference('Page.ViewPDF'));
            System.currentPageReference().getParameters().put('id', docList[0].Id);
            ViewPDFController.loadPageContents();
            
            List<Document_Content__c> newSectionList = new List<Document_Content__c>();
            newSectionList = [SELECT Id, Name FROM Document_Content__c WHERE Corporate_Document__c = :docList[0].Id];
            System.assertEquals(2, newSectionList.size());
        }
    }
}