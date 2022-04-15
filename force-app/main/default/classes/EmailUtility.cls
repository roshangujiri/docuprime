/**
 * @name         :    EmailUtility
 * @description  :    Contains email utility methods.
 */
public with sharing class EmailUtility {
    /**
	 * @description  :    Creates PDF document from corporate document object record
     *                    and attaches to the email being send.
	 * @param        :    String ccAddresses, String bccAddresses, String emailSubject, 
     *                    String emailbody, String documentName, Id corpDocId
	 * @return       :    void
	 */
    @AuraEnabled(cacheable=true)
    public static void sendEmailWithAttachedDocument(String toAddresses,
                                String ccAddresses, 
                                String bccAddresses, 
                                String emailSubject,
                                String emailbody,
                                String documentName,
                                Id corpDocId) 
    {
        List<String> emailIds = new List<String>();
        if(toAddresses != Null) {
            emailIds = toAddresses.split(',');
        }
        List<String> ccEmailIds;
        List<String> bccEmailIds;
        PageReference refpage = Page.ViewPDF;
        refpage.getParameters().put('id', corpDocId);
        
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        Messaging.EmailFileAttachment attach = new Messaging.EmailFileAttachment();
        attach.setContentType('application/pdf');
        attach.setFileName(documentName+'.pdf');
        attach.setInline(false);
        if(Test.isRunningTest()) {
            attach.Body = Blob.valueOf('Unit.Test');
        }
        else {
            attach.Body = refpage.getContentAsPDF();
        }
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(emailIds);
        if(ccAddresses != Null && ccAddresses.trim() != '') {
            ccEmailIds = ccAddresses.split(',');
            mail.setCcAddresses(ccEmailIds);
        }
        if(bccAddresses != Null && bccAddresses.trim() != '') {
            bccEmailIds = bccAddresses.split(',');
            mail.setBccAddresses(bccEmailIds);
        }
        String userName = UserInfo.getUserName();
        User activeUser = [SELECT Email FROM User WHERE Username = :userName WITH SECURITY_ENFORCED LIMIT 1];
        String userEmail = activeUser.Email;
        mail.setSenderDisplayName( UserInfo.getName()); 
        mail.setSubject(emailSubject);
        mail.setHtmlBody(emailbody);
        mail.setFileAttachments(new Messaging.EmailFileAttachment[] {attach});
        mails.add(mail);
        Messaging.sendEmail(mails);
    }
}