export class History{
    id?: string;

    rekening?: string;   // type: "c", length: 7, decimals: 0}
    nummer?: number;     // type: "n", length: 6, decimals: 0}
    bedr_deb?: number;   // type: "n", length: 11, decimals: 2}
    bedr_cre?: number;   // type: "n", length: 11, decimals: 2}
    omschr?: string;     // type: "c", length: 20, decimals: 0}
    afpunting?: string;  // type: "c", length: 1, decimals: 0}
    saldo?: number;      // type: "n", length: 13, decimals: 2}
    boeknr?: string;     // type: "c", length: 2, decimals: 0}
    stuknr?: number;     // type: "n", length: 6, decimals: 0}
    stuk_dat?: Date;     // type: "d", length: 8, decimals: 0}
    doc_dat?: Date;      // type: "d", length: 8, decimals: 0}
    verval_dat?: Date;   // type: "d", length: 8, decimals: 0}
    periode?: number;    // type: "n", length: 5, decimals: 0}
    plaats?: number;     // type: "n", length: 7, decimals: 0}
    saldo_vr?: number;   // type: "n", length: 10, decimals: 2}
    bedr_debvr?: number; // type: "n", length: 10, decimals: 2}
    bedr_crevr?: number; // type: "n", length: 10, decimals: 2}
    l_kl?: string;       // type: "c", length: 1, decimals: 0}
    afp2?: string;       // type: "c", length: 1, decimals: 0}
    saldo2?: number;     // type: "n", length: 12, decimals: 2}
    h1?: Date;           // type: "d", length: 8, decimals: 0}
    h2?: Date;           // type: "d", length: 8, decimals: 0}
    h3?: Date;           // type: "d", length: 8, decimals: 0}
    ogm?: string;        // type: "c", length: 14, decimals: 0}
}