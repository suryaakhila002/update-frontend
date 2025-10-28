import Dashboard from './pages/Dashboard/dashboard';

import ChangePassword from './pages/profile/ChangePassword';
import ForgotPassword from './pages/Auth/ForgotPassword';

import AllClients from './pages/Client/allClients';
// import AddNewClient from './pages/Client/addNewClient';
import ClientGroups from './pages/Client/clientGroups';
import ClientExportImport from './pages/Client/clientExportImport';
import ManageClient from './pages/Client/manageClient';
import MyProfile from './pages/Client/myProfile';
import SuperadminCreateClients from './pages/Client/superadminCreateClients';
import AdminCreateClients from './pages/Client/adminCreateClients';
import ResellerCreateClients from './pages/Client/resellerCreateClients';

import AllInvoices from './pages/Invoice/allInvoices';
import RecurringInvoices from './pages/Invoice/recurringInvoices';

import AllKeywoards from './pages/Keywoards/allKeywoards';
import AddNewKeywoard from './pages/Keywoards/addNewKeywoard';
import KeywoardsSetting from './pages/Keywoards/keywoardsSetting';

import PhoneBook from './pages/Contacts/phoneBook';
import ImportContact from './pages/Contacts/importContact';
import BlacklistContact from './pages/Contacts/blacklistContact';
import SpamWords from './pages/Contacts/spamWords';

import SendQuickSms from './pages/BulkSms/SendQuickSms';
import SendGroupSms from './pages/BulkSms/SendGroupSms';
import SendSmsFile from './pages/BulkSms/SendSmsFile';
import SendSheduleSms from './pages/BulkSms/SendSheduleSms';
import SendBulkSms from './pages/BulkSms/SendBulkSms';

import SenderIdManage from './pages/SenderIdManage/SenderIdManage';
import BlockSenderId from './pages/SenderIdManage/BlockSenderId';
import AddSenderId from './pages/SenderIdManage/AddSenderId';

import SmsRoutes from './pages/SmsRoutes/SmsRoutes';

import SmsTemplate from './pages/SmsTemplate/SmsTemplate';
import AddSmsTemplate from './pages/SmsTemplate/AddSmsTemplate';
import UpdateSmsTemplate from './pages/SmsTemplate/UpdateSmsTemplate';

import SmsReport from './pages/Reports/SmsReport';
import SmsHistory from './pages/Reports/SmsHistory';
import Queue from './pages/Reports/Queue';
import ManageReport from './pages/Reports/ManageReport';

import Groups from './pages/Groups/Groups';

import SmsApi from './pages/SmsApi/SmsApi';

import Coverage from './pages/Coverage/coverage';

import AddPricePlan from './pages/Plans/addPricePlan';
import ViewBundlePlan from './pages/Plans/viewBundlePlan';
import AddBundle from './pages/Plans/addBundle';
import ViewFixedPlan from './pages/Plans/viewFixedPlan';

import Administrators from './pages/Administrator/Administrators';
import AdministratorRoles from './pages/Administrator/AdministratorRoles';

import AllSupportTickets from './pages/support/AllSupportTickets';
import CreateNewTicket from './pages/support/CreateNewTicket';
import SupportDepartments from './pages/support/SupportDepartments';
import ViewSupportDepartments from './pages/support/ViewSupportDepartments';
import ManageTicket from './pages/support/ManageTicket';

import BlankPage from './pages/ExtraPages/pages-blank';
import Pageslogin from './pages/Auth/Login';
import Logout from './pages/Auth/Logout';

import Settings from './pages/Settings/Settings';

//Recharge
import ViewFixedPlansRecharge from './pages/Recharge/ViewFixedPlans';
import BuyUnit from './pages/Recharge/BuyUnit';

//Landing Page
// import Landing from './pages/landing/landing'; 
// import Login from './pages/Auth/Login';

const routes = [
    
    // Profile
    { path: '/changePassword', component: ChangePassword },
    
    // Dashnoard
    { path: '/dashboard', component: Dashboard },

    //Client
    { path: '/allClients', component: AllClients },
    // { path: '/addNewClient', component: AddNewClient },
    { path: '/clientGroups', component: ClientGroups },
    { path: '/clientExportImport', component: ClientExportImport },
    { path: '/manageClient', component: ManageClient },
    { path: '/profile', component: MyProfile },
    { path: '/superadminCreateClients', component: SuperadminCreateClients },
    { path: '/adminCreateClients', component: AdminCreateClients },
    { path: '/resellerCreateClients', component: ResellerCreateClients },

    //Invoice
    { path: '/allInvoices', component: AllInvoices },
    { path: '/recurringInvoices', component: RecurringInvoices },

    //Keyword
    { path: '/allKeywoards', component: AllKeywoards },
    { path: '/addNewKeywoard', component: AddNewKeywoard },
    { path: '/keywoardsSetting', component: KeywoardsSetting },

    //Contact
    { path: '/phoneBook', component: PhoneBook },
    { path: '/importContact', component: ImportContact },
    { path: '/blacklistContact', component: BlacklistContact },
    { path: '/spamWords', component: SpamWords },

    //coverage
    { path: '/coverage', component: Coverage },

    //administrators
    { path: '/administrators', component: Administrators },
    { path: '/administratorRoles', component: AdministratorRoles },

    //Sms Plans
    { path: '/addPricePlan', component: AddPricePlan },
    { path: '/viewBundlePlan', component: ViewBundlePlan },
    { path: '/addBundle', component: AddBundle },    
    { path: '/viewFixedPlan', component: ViewFixedPlan},

    //Recharge
    { path: '/viewFixedRechargePlans', component: ViewFixedPlansRecharge },
    { path: '/buyUnit', component: BuyUnit },
    

    //support
    { path: '/allSupportTickets', component: AllSupportTickets },
    { path: '/createNewTicket', component: CreateNewTicket },
    { path: '/supportDepartments', component: SupportDepartments },
    { path: '/viewSupportDepartments', component: ViewSupportDepartments },
    { path: '/manageTicket', component: ManageTicket },

    //bulk sms
    { path: '/sendQuickSms', component: SendQuickSms },
    { path: '/sendGroupSms', component: SendGroupSms },
    { path: '/sendBulkSms', component: SendBulkSms },
    { path: '/sendSheduleSms', component: SendSheduleSms },
    { path: '/sendSmsFile', component: SendSmsFile },

    //sender id manage
    { path: '/senderIdManage', component: SenderIdManage },
    { path: '/blockSenderId', component: BlockSenderId },
    { path: '/addSenderId', component: AddSenderId },

    //route
    { path: '/smsRoutes', component: SmsRoutes },

    { path: '/settings', component: Settings },

    { path: '/smsReport', component: SmsReport },
    { path: '/smsHistory', component: SmsHistory },
    { path: '/queue', component: Queue },
    { path: '/manageReport', component: ManageReport},

    { path: '/groups', component: Groups },

    { path: '/smsApi', component: SmsApi },

    { path:'/smsTemplate', component: SmsTemplate },
    { path:'/addSmsTemplate', component: AddSmsTemplate },
    { path:'/updateSmsTemplate', component: UpdateSmsTemplate },

    { path:'/pages-blank', component: BlankPage },
    
    { path: '/logout', component: Logout, ispublic: true},
    { path: '/login', component: Pageslogin, ispublic: true},
    { path: '/forget-password', component: ForgotPassword, ispublic: true},
    
    { path: '/', component: Pageslogin, ispublic: true},
    

];

export default routes;