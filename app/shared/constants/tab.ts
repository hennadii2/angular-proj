import { Tab } from "../../tab/tab";

export const TABS: any = {
    'customer'          : new Tab('MENU.CUSTOMERS', 'customerTpl', 'customer', {}),
    'invoice'           : new Tab('MENU.INVOICES', 'invoicesTpl', 'invoice', {}),
    'supplier'          : new Tab('MENU.SUPPLIERS', 'suppliersTpl', 'supplier', {}),
    'quotation'         : new Tab('MENU.QUOTATIONS', 'quotationsTpl', 'quotation', {}),
    'order'             : new Tab('MENU.ORDER_RECEIPTS', 'ordersTpl', 'order', {}),
    'delivery'          : new Tab('MENU.DELIVERY_NOTES', 'deliverysTpl', 'delivery', {}),
    'article'           : new Tab('MENU.ARTICLES', 'articlesTpl', 'article', {}),
    'report'            : new Tab('MENU.REPORTS', 'reportsTpl', 'report', {}),
    'makefreeuser'      : new Tab('MENU.MAKE_FREE_USER', 'makefreeuserTpl', 'makefreeuser', {}),   
}
