import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import BasicTableOne from "../components/tables/BasicTables/BasicTableOne";
import BasicTableTwo from "../components/tables/BasicTables/BasicTableTwo";
import BasicTableThree from "../components/tables/BasicTables/BasicTableThree";
import BasicTableFour from "../components/tables/BasicTables/BasicTableFour";
import BasicTableFive from "../components/tables/BasicTables/BasicTableFive";

const Calendar: React.FC = () => {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard |  "
        description="This is React.js Basic Tables Dashboard page for  Atommarts"
      />
      <PageBreadcrumb pageTitle="All Orders" />
      <div className="space-y-6">
        <ComponentCard title="Orders">
          <BasicTableFour />
        </ComponentCard>
      </div>
    </>
  );
};

export default Calendar;
