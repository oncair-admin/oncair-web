export interface NavItem {
    displayName?: string;
    ItemId?: number;
    audience?: 'admin' | 'corporate' | 'both';
    permissionCode?: string;
    disabled?: boolean;
    external?: boolean;
    twoLines?: boolean;
    chip?: boolean;
    iconName?: string;
    navCap?: string;
    chipContent?: string;
    chipClass?: string;
    subtext?: string;
    route?: string;
    children?: NavItem[];
    ddType?: string;
    bgcolor?:string;
}