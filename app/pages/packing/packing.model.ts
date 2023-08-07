export class PackingProduct{
    id: number;
    art_nummer: string;
    box: PackingProductBox[];
    hoev: number;
    locatie: string;
    omschr_new: string;
    scan: number;
    search: string[];
    production: boolean;
    stock?: number;
    ref?: string;
    locations?: any[]=[];
    stock_omschr_n?: string;
    serial?: boolean;
    serialnumbers?: any[]=[];
    children?: PackingProduct[]=[];
}

export class Packing {
    id: number;
    products: PackingProduct[]=[];
    title: string;
    remark: string;
    date: string;
}

export class PackingUser {
    id: string;
    naam: string;
    persoon: string;
}

export class PackingProductBox {
    box: number;
    hoev: number;
}

export class PackingBoxes {
    id: number = 0;
    box: any[]=[];
    boxes: number = 0;
    pallet: number = 0;
    paymentcondition: string = '';
    deliverycondition: string = '';
}

export enum PackingProductField {
    id = "id",
    art_nummer = "art_nummer",
    box = "box",
    hoev = "hoev",
    locatie = "locatie",
    omschr_new = "omschr_new",
    scan = "scan",
    search = "search",
    production = "production",
    locations = "locations",
    stock_omschr_n = "stock_omschr_n",
    serial = "serial",
    serialnumbers = "serialnumbers",
    stock = "stock",
    ref = "ref"
}

