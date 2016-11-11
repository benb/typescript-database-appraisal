    export interface Indexed {
        'date-parts': number[][];
        'date-time': Date;
        'timestamp': any;
    }

    export interface ContentDomain {
        'domain': string[];
        'crossmark-restriction': boolean;
    }

    export interface PublishedPrint {
        'date-parts': number[][];
    }

    export interface Created {
        'date-parts': number[][];
        'date-time': Date;
        'timestamp': any;
    }

    export interface Affiliation {
        'name': string;
    }

    export interface Author {
        'affiliation': Affiliation[];
        'family': string;
        'given': string;
    }

    export interface PublishedOnline {
        'date-parts': number[][];
    }

    export interface Deposited {
        'date-parts': number[][];
        'date-time': Date;
        'timestamp': any;
    }

    export interface Issued {
        'date-parts': number[][];
    }

    export interface Start {
        'date-parts': number[][];
        'date-time': Date;
        'timestamp': any;
    }

    export interface License {
        'content-version': string;
        'delay-in-days': number;
        'start': Start;
        'URL': string;
    }

    export interface Link {
        'intended-application': string;
        'content-version': string;
        'content-type': string;
        'URL': string;
    }

    export interface Assertion {
        'label': string;
        'name': string;
        'value': string;
    }

    export interface Funder {
        'award': any[];
        'doi-asserted-by': string;
        'name': string;
        'DOI': string;
    }

    export interface CrossRefRecord {
        'indexed': Indexed;
        'reference-count': number;
        'publisher': string;
        'issue': string;
        'content-domain': ContentDomain;
        'short-container-title': string[];
        'published-print': PublishedPrint;
        'DOI': string;
        'type': string;
        'created': Created;
        'page': string;
        'source': string;
        'title': string[];
        'prefix': string;
        'volume': string;
        'author': Author[];
        'member': string;
        'published-online': PublishedOnline;
        'container-title': string[];
        'original-title': string[];
        'deposited': Deposited;
        'score': number;
        'subtitle': string[];
        'short-title': any[];
        'issued': Issued;
        'URL': string;
        'ISSN': string[];
        'subject': string[];
        'license': License[];
        'link': Link[];
        'alternative-id': string[];
        'update-policy': string;
        'assertion': Assertion[];
        'ISBN': string[];
        'funder': Funder[];
    }
