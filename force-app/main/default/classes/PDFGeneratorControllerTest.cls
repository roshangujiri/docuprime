@isTest
public class PDFGeneratorControllerTest {
    @isTest
    static void testSaveAsPDFAttachment() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);//
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            PDFGeneratorController.saveAsPDFAttachment(accList[0].Id, docList[0].Id, 'Demo Document 1');
            PDFGeneratorController.saveAsPDFAttachment(accList[0].Id, docList[0].Id, 'Demo Document 2');
            List<ContentDocumentLink> docLinklist = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityId = :accList[0].Id];
            System.assertEquals(docLinklist.size(), 2);
        }
    }
  @isTest
    static void testSaveDocumentAndSendForEsign() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            Document_Esign__c docEsgn = new Document_Esign__c();
            docEsgn.Esign_Webhook_URL__c = 'https://hook.integromat.com/jbem7amsmxffleh7yhvzs42rq3ruqg8a?service=Zoho+Esign';
            insert docEsgn;
            List<Account> accList = TestDataFactory.createAccounts(1, 'Test Account', true);//
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            Test.setMock(HttpCalloutMock.class, new WebhookCalloutHttpCalloutMockGenegrator()); 
            PDFGeneratorController.saveDocumentAndSendForEsign(accList[0].Id, docList[0].Id, 'Demo Document 1', 'Test Service', 'Test Approver', 'test@gmail.com');
            List<ContentDocumentLink> docLinklist = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityId = :accList[0].Id];
            System.assertEquals(docLinklist.size(), 1);
        }
    }
}