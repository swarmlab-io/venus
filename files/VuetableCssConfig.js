export default {
  table: {
    tableWrapper: '',
    tableHeaderClass: 'mb-0',
    tableBodyClass: 'mb-0',
    tableClass: 'table table-bordered table-hover table-sm table-condensed whitespace',
    loadingClass: 'loading',
    ascendingIcon: 'fa fa-chevron-up',
    descendingIcon: 'fa fa-chevron-down',
    ascendingClass: 'sorted-asc',
    descendingClass: 'sorted-desc',
    sortableIcon: 'fa fa-sort',
    detailRowClass: 'vuetable-detail-row',
    handleIcon: 'fa fa-bars text-secondary',
    renderIcon: function(classes, options) {
			return `<i class="${classes.join(" ")}" ${options}></span>`;
    }
  },
  paginationInfo: {
    infoClass: 'pull-left float-left align-self-end'
},
  pagination: {
    wrapperClass: "pagination pull-right float-right",
    activeClass: "active",
    disabledClass: "disabled",
    pageClass: "btn btn-border",
    linkClass: "btn btn-border",
 		paginationClass: "pagination",
    paginationInfoClass: "float-left",
				//pagination-info-class=""
				//pagination-component-class=""
		dropdownClass: "form-control",
    icons: {
      first: "",
      prev: "",
      next: "",
      last: ""
    }
  }
}
