@isTest
public class TestUtils {
    public static User generateDocuPadAdminForTest() {
        String uniqueUserName = 'docupaduser' + DateTime.now().getTime() + '@testorg.com';
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        User docuPadAdmin = new User(Alias = 'docuad', Email='docupaduser@testorg.com',
                                 EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                                 LocaleSidKey='en_US', ProfileId = p.Id,
                                 TimeZoneSidKey='America/Los_Angeles',
                                 UserName=uniqueUserName);
        INSERT docuPadAdmin;
        
        PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'DocuPad_Admin'];
        INSERT new PermissionSetAssignment(AssigneeId = docuPadAdmin.id, PermissionSetId = ps.Id);
        return docuPadAdmin;
    }
    
    public static User generateDocuPadUserForTest() {
        String uniqueUserName = 'docupaduser' + DateTime.now().getTime() + '@testorg.com';
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        User docuPadUser = new User(Alias = 'docuus', Email='docupaduser@testorg.com',
                                 EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                                 LocaleSidKey='en_US', ProfileId = p.Id,
                                 TimeZoneSidKey='America/Los_Angeles',
                                 UserName=uniqueUserName);
        INSERT docuPadUser;
        
        PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'DocuPad_User'];
        INSERT new PermissionSetAssignment(AssigneeId = docuPadUser.id, PermissionSetId = ps.Id);
        return docuPadUser;
    }
}