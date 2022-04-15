@isTest
public class EmailUtilityTest {
    @isTest
    static void testSendEmailWithAttachedDocument() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            List<Document_Template__c> templateList = TestDataFactory.createTemplates(1, 'Demo Template', '', true);
            List<Corporate_Document__c> docList = TestDataFactory.createDocuments(1, '', templateList[0].Id, true);
            TestDataFactory.createSectionsForDocument(2, 'Section', docList[0].Id, true);
            Test.StartTest();
            EmailUtility.sendEmailWithAttachedDocument('testuser1@testorg.com',
                                                       'testuser2@testorg.com',
                                                       'testuser3@testorg.com',
                                                       'emailSubject',
                                                       'emailbody',
                                                       'Demo Template',
                                                       docList[0].Id);
            Integer invocations = Limits.getEmailInvocations();
            Test.stopTest();
            System.assertEquals(1, invocations, 'An email has not been sent');
        }
    }
}