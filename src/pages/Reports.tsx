import React, { useState } from 'react';
import { Download, BarChart4, Calendar, Package, AlertTriangle, Users, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useProductStore } from '../store/productStore';
import { useClientStore } from '../store/clientStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { formatDate, isExpiringSoon, isExpired, calculateDaysRemaining } from '../lib/utils';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Report types
type ReportType = 'inventory' | 'expiry' | 'assignments';

export default function Reports() {
  const { products } = useProductStore();
  const { clients } = useClientStore();
  const { assignments } = useAssignmentStore();
  
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterClient, setFilterClient] = useState('');
  
  // Get all unique categories
  const categories = [...new Set(products.map(p => p.category))];
  
  // Filter products for inventory report
  const filteredProducts = products.filter(product => {
    if (filterCategory && product.category !== filterCategory) {
      return false;
    }
    return true;
  });
  
  // Filter for expiry report
  const expiringProducts = products.filter(product => {
    if (filterCategory && product.category !== filterCategory) {
      return false;
    }
    // Check if product is expiring in the next 90 days
    return isExpiringSoon(product.expiryDate, 90) || isExpired(product.expiryDate);
  }).sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });
  
  // Filter assignments for assignment report
  const filteredAssignments = assignments.filter(assignment => {
    const assignmentDate = new Date(assignment.createdAt);
    
    if (startDate) {
      const startDateTime = new Date(startDate);
      if (assignmentDate < startDateTime) {
        return false;
      }
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59);
      if (assignmentDate > endDateTime) {
        return false;
      }
    }
    
    if (filterCategory && assignment.product.category !== filterCategory) {
      return false;
    }
    
    if (filterClient && assignment.clientId !== filterClient) {
      return false;
    }
    
    return true;
  });
  
  // Prepare data for chart
  const prepareChartData = () => {
    if (reportType === 'inventory') {
      // Group by category
      const categoryData = categories.map(category => {
        return {
          category,
          count: products.filter(p => p.category === category).length,
          totalItems: products
            .filter(p => p.category === category)
            .reduce((sum, p) => sum + p.quantity, 0)
        };
      });
      
      return {
        labels: categoryData.map(d => d.category),
        datasets: [
          {
            label: 'Total Items',
            data: categoryData.map(d => d.totalItems),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Product Types',
            data: categoryData.map(d => d.count),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      };
    } else if (reportType === 'expiry') {
      // Group by month
      const months: { [key: string]: number } = {};
      
      expiringProducts.forEach(product => {
        const date = new Date(product.expiryDate);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!months[monthYear]) {
          months[monthYear] = 0;
        }
        
        months[monthYear]++;
      });
      
      // Convert to sorted array
      const sortedMonths = Object.keys(months).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });
      
      return {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Expiring Products',
            data: sortedMonths.map(month => months[month]),
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1
          }
        ]
      };
    } else {
      // Assignments by client
      const clientCounts: { [key: string]: number } = {};
      
      filteredAssignments.forEach(assignment => {
        if (!clientCounts[assignment.client.name]) {
          clientCounts[assignment.client.name] = 0;
        }
        
        clientCounts[assignment.client.name] += assignment.quantity;
      });
      
      // Sort by count
      const sortedClients = Object.keys(clientCounts).sort((a, b) => {
        return clientCounts[b] - clientCounts[a];
      }).slice(0, 10); // Top 10
      
      return {
        labels: sortedClients,
        datasets: [
          {
            label: 'Items Assigned',
            data: sortedClients.map(client => clientCounts[client]),
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
            borderColor: 'rgba(124, 58, 237, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  };
  
  const chartData = prepareChartData();
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: reportType === 'inventory' 
          ? 'Inventory by Category' 
          : reportType === 'expiry' 
            ? 'Products Expiring Soon' 
            : 'Top Clients by Assignments',
      },
    },
  };
  
  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(
      reportType === 'inventory' 
        ? 'Inventory Report' 
        : reportType === 'expiry' 
          ? 'Expiry Report' 
          : 'Assignment Report', 
      14, 
      22
    );
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 30);
    
    if (reportType === 'inventory') {
      // Create table data
      const tableData = filteredProducts.map(product => [
        product.name,
        product.category,
        product.quantity.toString(),
        product.unit,
        formatDate(product.expiryDate),
        product.manufacturer
      ]);
      
      // Add table
      (doc as any).autoTable({
        startY: 35,
        head: [['Product Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Manufacturer']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });
    } else if (reportType === 'expiry') {
      // Create table data
      const tableData = expiringProducts.map(product => [
        product.name,
        product.category,
        product.quantity.toString(),
        product.unit,
        formatDate(product.expiryDate),
        isExpired(product.expiryDate) 
          ? 'Expired' 
          : `${calculateDaysRemaining(product.expiryDate)} days`
      ]);
      
      // Add table
      (doc as any).autoTable({
        startY: 35,
        head: [['Product Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });
    } else {
      // Create table data
      const tableData = filteredAssignments.map(assignment => [
        assignment.product.name,
        assignment.client.name,
        assignment.quantity.toString(),
        assignment.product.unit,
        formatDate(assignment.createdAt),
        assignment.assignedBy.name
      ]);
      
      // Add table
      (doc as any).autoTable({
        startY: 35,
        head: [['Product', 'Client', 'Quantity', 'Unit', 'Date', 'Assigned By']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });
    }
    
    // Save the PDF
    doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  // Export to Excel
  const exportToExcel = () => {
    let data: any[] = [];
    
    if (reportType === 'inventory') {
      data = filteredProducts.map(product => ({
        'Product Name': product.name,
        'Category': product.category,
        'Quantity': product.quantity,
        'Unit': product.unit,
        'Manufacturer': product.manufacturer,
        'Batch Number': product.batchNumber,
        'Expiry Date': formatDate(product.expiryDate),
        'Reorder Level': product.reorderLevel,
        'Cost Per Unit': product.costPerUnit
      }));
    } else if (reportType === 'expiry') {
      data = expiringProducts.map(product => ({
        'Product Name': product.name,
        'Category': product.category,
        'Quantity': product.quantity,
        'Unit': product.unit,
        'Expiry Date': formatDate(product.expiryDate),
        'Days Remaining': calculateDaysRemaining(product.expiryDate),
        'Status': isExpired(product.expiryDate) ? 'Expired' : 'Expiring Soon',
        'Batch Number': product.batchNumber,
        'Manufacturer': product.manufacturer
      }));
    } else {
      data = filteredAssignments.map(assignment => ({
        'Product': assignment.product.name,
        'Category': assignment.product.category,
        'Client': assignment.client.name,
        'Client Type': assignment.client.type,
        'Quantity': assignment.quantity,
        'Unit': assignment.product.unit,
        'Assigned By': assignment.assignedBy.name,
        'Date': formatDate(assignment.createdAt),
        'Notes': assignment.notes || ''
      }));
    }
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Generate Excel file
    XLSX.writeFile(workbook, `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        
        <div className="flex space-x-2">
          <Button 
            onClick={exportToPdf}
            className="flex items-center"
            variant="outline"
          >
            <Download size={18} className="mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={exportToExcel}
            className="flex items-center"
          >
            <Download size={18} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${
            reportType === 'inventory' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => setReportType('inventory')}
        >
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Inventory Report</CardTitle>
              <CardDescription className="text-xs">
                Overview of current stock levels
              </CardDescription>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-colors ${
            reportType === 'expiry' ? 'ring-2 ring-amber-500 bg-amber-50' : ''
          }`}
          onClick={() => setReportType('expiry')}
        >
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-amber-100 mr-3">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Expiry Report</CardTitle>
              <CardDescription className="text-xs">
                Products expiring soon or expired
              </CardDescription>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-colors ${
            reportType === 'assignments' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
          }`}
          onClick={() => setReportType('assignments')}
        >
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-purple-100 mr-3">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Assignment Report</CardTitle>
              <CardDescription className="text-xs">
                Product assignment history
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters based on report type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter size={18} className="mr-2 text-gray-600" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category filter for all reports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Date filters for assignment report */}
            {reportType === 'assignments' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select 
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart4 size={18} className="mr-2 text-gray-600" />
            {reportType === 'inventory' 
              ? 'Inventory Distribution' 
              : reportType === 'expiry' 
                ? 'Expiry Timeline' 
                : 'Assignment Distribution'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
      
      {/* Table data based on report type */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'inventory' 
              ? 'Inventory Details' 
              : reportType === 'expiry' 
                ? 'Products Expiring Soon' 
                : 'Recent Assignments'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {reportType === 'inventory' && (
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              )}
              
              {reportType === 'expiry' && (
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              )}
              
              {reportType === 'assignments' && (
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {reportType === 'inventory' && filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.quantity} {product.unit}(s)</TableCell>
                  <TableCell>{product.manufacturer}</TableCell>
                  <TableCell>{product.batchNumber}</TableCell>
                  <TableCell>
                    {isExpired(product.expiryDate) ? (
                      <span className="text-red-600 font-medium">Expired</span>
                    ) : isExpiringSoon(product.expiryDate) ? (
                      <span className="text-amber-600">{formatDate(product.expiryDate)}</span>
                    ) : (
                      formatDate(product.expiryDate)
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {reportType === 'expiry' && expiringProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.quantity} {product.unit}(s)</TableCell>
                  <TableCell>{product.batchNumber}</TableCell>
                  <TableCell>{formatDate(product.expiryDate)}</TableCell>
                  <TableCell>
                    {isExpired(product.expiryDate) ? (
                      <span className="text-red-600 font-medium">Expired</span>
                    ) : (
                      <span className="text-amber-600">
                        {calculateDaysRemaining(product.expiryDate)} days remaining
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {reportType === 'assignments' && filteredAssignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.product.name}</TableCell>
                  <TableCell>{assignment.client.name}</TableCell>
                  <TableCell>{assignment.quantity} {assignment.product.unit}(s)</TableCell>
                  <TableCell>{assignment.assignedBy.name}</TableCell>
                  <TableCell>{formatDate(assignment.createdAt)}</TableCell>
                  <TableCell>{assignment.notes || '-'}</TableCell>
                </TableRow>
              ))}
              
              {/* Empty state */}
              {((reportType === 'inventory' && filteredProducts.length === 0) || 
                (reportType === 'expiry' && expiringProducts.length === 0) ||
                (reportType === 'assignments' && filteredAssignments.length === 0)) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      {reportType === 'inventory' && <Package size={48} className="text-gray-300 mb-2" />}
                      {reportType === 'expiry' && <AlertTriangle size={48} className="text-gray-300 mb-2" />}
                      {reportType === 'assignments' && <ClipboardList size={48} className="text-gray-300 mb-2" />}
                      <p>No data available for the selected filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Filter icon component
function Filter({ size, className }: { size: number, className?: string }) {
  return (
    <div className={className}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    </div>
  );
}