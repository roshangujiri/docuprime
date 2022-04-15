@isTest
public class TransationalDataControllerTest {
    @isTest
    public static void testGetUserInfo() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            String returnValue = TransationalDataController.getUserInfo('Name');
            String returnValueInavlid = TransationalDataController.getUserInfo('Invalid');
            System.assertEquals(returnValue != Null, true);
            System.assertEquals(returnValueInavlid != Null, false);
        }
    }

    @isTest
    public static void testGetOrgInfo() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            String returnValue = TransationalDataController.getOrgInfo('Name');
            String returnValueInavlid = TransationalDataController.getOrgInfo('Invalid');
            String returnValueAddress = TransationalDataController.getOrgInfo('Address');
            System.assertEquals(returnValue != Null, true);
            System.assertEquals(returnValueInavlid != Null, false);
            System.assertEquals(returnValueAddress != Null, true);
        }
    } 

    @isTest
    public static void testGetCustomSettings() {
        Document_Esign__c customSetting = new Document_Esign__c();
        customSetting.Esign_Webhook_URL__c = 'https://hook.integromat.com/jbem7amsmxffleh7yhvzs42rq3ruqg8a';
        INSERT customSetting;
        String returnValue = TransationalDataController.getCustomSettings('Document_Esign__c','Esign_Webhook_URL__c');
        System.assertEquals(returnValue == Null, true);
        
    }

    @isTest
    public static void testGetCustomMetaData() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        String returnValue = TransationalDataController.getCustomMetaData('MyCustomSetting__mdt','label', 'Field__c');
        System.assertEquals(returnValue != Null, false);
    }
}