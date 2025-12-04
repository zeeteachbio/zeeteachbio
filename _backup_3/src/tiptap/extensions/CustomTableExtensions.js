import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

// Custom TableCell extension with support for styling attributes
export const CustomTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            colspan: {
                default: 1,
            },
            rowspan: {
                default: 1,
            },
            colwidth: {
                default: null,
                parseHTML: element => {
                    const colwidth = element.getAttribute('colwidth');
                    return colwidth ? [parseInt(colwidth, 10)] : null;
                },
            },
            style: {
                default: null,
                parseHTML: element => element.getAttribute('style'),
                renderHTML: attributes => {
                    if (!attributes.style) {
                        return {};
                    }
                    return {
                        style: attributes.style,
                    };
                },
            },
        };
    },
});

// Custom TableHeader extension with same styling support
export const CustomTableHeader = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            colspan: {
                default: 1,
            },
            rowspan: {
                default: 1,
            },
            colwidth: {
                default: null,
                parseHTML: element => {
                    const colwidth = element.getAttribute('colwidth');
                    return colwidth ? [parseInt(colwidth, 10)] : null;
                },
            },
            style: {
                default: null,
                parseHTML: element => element.getAttribute('style'),
                renderHTML: attributes => {
                    if (!attributes.style) {
                        return {};
                    }
                    return {
                        style: attributes.style,
                    };
                },
            },
        };
    },
});
