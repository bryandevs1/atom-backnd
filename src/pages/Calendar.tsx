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
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="All Products" />
      <div className="space-y-6">

        <ComponentCard title="Products">
          <BasicTableThree />
        </ComponentCard>

      </div>
    </>
  );
};

export default Calendar;
