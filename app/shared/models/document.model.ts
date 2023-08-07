export class Document{
    id?: string;

    nummer: number;             //, type: "n", length: 6, decimals: 0}
    datum: Date;                //, type: "d", length: 8, decimals: 0}
    verslag: string;            //, type: "m", length: 10, decimals: 0}
    afspraak: string;           //, type: "m", length: 10, decimals: 0}
    todo: string;               //, type: "c", length: 50, decimals: 0}
    nextdate: Date;             //, type: "d", length: 8, decimals: 0}
    wijze: string;              //, type: "c", length: 10, decimals: 0}
    alert: boolean = false;     //, type: "l", length: 1, decimals: 0}
    persoon: string;            //, type: "c", length: 30, decimals: 0}
    code_vert: string;          // type: "c", length: 3, decimals: 0}
    klachten: boolean = false;  //, type: "l", length: 1, decimals: 0}
    wensen: boolean = false; ;  //, type: "l", length: 1, decimals: 0}
    file: string                //, type: "c", length: 50, decimals: 0}
}