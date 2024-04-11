export const colorizeString = (str: string, color: string) => `^[${color};${str}^]`;
export const decolorizeString = (str: string) => {
    const matched = str.match(/\^\[#[0-9a-f]{6};(.*)\^\](.*)/);
    return matched ? matched.slice(1).join('') : str;
};
