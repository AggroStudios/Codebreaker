import isEmpty from 'lodash/isEmpty';

export const dataSizeSuffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];

export const dataSizeFromSuffix = ({ size, unit }) => {
    const index = dataSizeSuffixes.indexOf(unit);
    if (index === -1) {
        return size;
    }
    return size * Math.pow(1024, index);
}

export const dataSizeSuffix = (value: number, startPoint: number = 0) => {
    let index = 0;
    let currentValue = value;

    while (Math.floor(currentValue / 1024) > 0 && (index + startPoint + 1) < dataSizeSuffixes.length) {
        currentValue /= 1024;
        index++;
    } 

    return `${Number(currentValue.toFixed(2))} ${dataSizeSuffixes[index + startPoint]}`;
};

export const path = class Path {

    static extname(path: string) {
        const exploded = path.split('.');
        if (exploded[0] === '') exploded.shift();
        if (exploded.length > 1) {
            return `.${exploded.pop()}`;
        }
        else {
            return '';
        }
    }

    static normalize(path: string) {
        if (isEmpty(path)) return;

        return path.split('/').reduce((acc: string[], cur: string) => {
            if (cur === '..') {
                acc.pop();
            }
            else if (cur !== '.') {
                acc.push(cur);
            }
            return acc;
        }, []).join('/');
    }

    static parse(path: string) {
        path = this.normalize(path) || '';
        const root = '/';
        const parts = path.split('/').slice(1);
        const base = parts.pop() || '';
        const dir = root + parts.join('/');
        const ext = this.extname(base);
        const name = base.slice(0, base.length - ext.length);

        return {
            root,
            dir,
            base,
            name,
            ext
        }
    }
    
    static dirname(path: string) {
        return Path.parse(path).dir;
    }

    static basename(path: string, excludeExt: string = '') {
        const { name, ext, base } = this.parse(path);
        return ext === excludeExt ? name : base;
    }

    static isAbsolute(path: string) {
        return path.startsWith('/');
    }

    static join(...paths: string[]) {
        return this.normalize(paths.join('/'));
    }

    static format(pathObject:{dir:string, base:string}) {
        return `${pathObject.dir}/${pathObject.base}`.replaceAll('//', '/').replace(/(.*?)\/$/, '$1') || '/';
    }
};