export let widthConsts = {
    index: 2,
    dropdown: 3,
    //
    corr: 2,
    smallText : 2,
    number: 2.5,
    editing: 4,
    comments: 7,
    //
    compute: 1
}

// Definitions of names and visual widths of columns for job types
export const widths = {
    get slides() {
        return {
            "#" : widthConsts.index,
            "DPI" : widthConsts.dropdown,
            "Corr." : widthConsts.corr, 
            "Scan" : widthConsts.number,
            "HS" : widthConsts.number,
            "Editing" : widthConsts.editing,
            "Comments" : widthConsts.comments,
            "" : widthConsts.compute
        }
    },
    get prints() {
        return {
            "#" : widthConsts.index,
            "DPI" : widthConsts.dropdown,  
            "Corr." : widthConsts.corr, 
            "LP" : widthConsts.number,
            "HS" : widthConsts.number,
            "OSHS" : widthConsts.number,
            "Editing" : widthConsts.editing,
            "Comments" : widthConsts.comments,
            "" : widthConsts.compute
        }
    },
    get negatives() {
        return {
            "#" : widthConsts.index,
            "DPI" : widthConsts.dropdown,  
            "Corr." : widthConsts.corr, 
            "Strips" : widthConsts.number,
            "Count" : widthConsts.number,
            "HS" : widthConsts.number,
            "Editing" : widthConsts.editing,
            "Comments" : widthConsts.comments,
            "" : widthConsts.compute
        }
    },
    get video() {
        return {
            "#" : widthConsts.index,
            "Type" : widthConsts.dropdown,
            "DVD #" : widthConsts.smallText,
            "VCR" : widthConsts.smallText,
            "Station #" : widthConsts.smallText,
            "Editing" : widthConsts.editing,
            "Comments" : widthConsts.comments,
            "" : widthConsts.compute
        }
    },
    get data() {
        return {
            "#" : widthConsts.index,
            "Type" : widthConsts.dropdown,
            "Editing" : widthConsts.editing,
            "Comments" : widthConsts.comments,
            "" : widthConsts.compute
        }
    },
    getSumColumnWidthsRem: function(name) {
        return Object.entries(this[name]).reduce((a, [key, value]) => a + value, 0);
    },
    getColumnGapsPx: function(name) {
        // There is 7.5px of extra padding on either end of Row.svelte
        return 15 + (10 * (Object.entries(this[name]).length));    // Subtracts one from length to get gaps between columns, then add horizontal padding
    },
    getWidth: function(name) {
        let res = [this.getSumColumnWidthsRem(name), this.getColumnGapsPx(name)];
        return res;
    }
}