import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Upload, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatNumber, getStatusColor, getPriorityColor } from '@/lib/utils'
import type { CargoEnquiry, Port } from '@/types'
import { CARGO_TYPES, VESSEL_TYPES } from '@/lib/constants'

export default function CargoEnquiries() {
  const [enquiries, setEnquiries] = useState<CargoEnquiry[]>([])
  const [filteredEnquiries, setFilteredEnquiries] = useState<CargoEnquiry[]>([])
  const [portsList, setPortsList] = useState<Port[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    origin_port_id: '',
    destination_port_id: '',
    commodity: '',
    cargo_quantity_tons: '',
    earliest_charter_date: '',
    required_arrival_date: '',
    preferred_vessel_class: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [data, ports] = await Promise.all([
        api.getCargoEnquiries(),
        api.getPorts()
      ])
      setEnquiries(data)
      setFilteredEnquiries(data)
      setPortsList(ports)
    } catch (err) {
      console.error('Failed to fetch cargo enquiries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = enquiries

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.cargoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase())
    }

    if (cargoTypeFilter !== 'all') {
      filtered = filtered.filter((e) => e.cargoType.toLowerCase() === cargoTypeFilter.toLowerCase())
    }

    setFilteredEnquiries(filtered)
  }, [searchTerm, statusFilter, cargoTypeFilter, enquiries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createCargoEnquiry(formData as any)
      setShowForm(false)
      setFormData({
        origin_port_id: '',
        destination_port_id: '',
        commodity: '',
        cargo_quantity_tons: '',
        earliest_charter_date: '',
        required_arrival_date: '',
        preferred_vessel_class: ''
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to create enquiry:', error)
      alert('Failed to create enquiry. Make sure the port codes are valid (e.g. INPRT).')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading cargo enquiries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Cargo Enquiries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage cargo requirements and match with suitable vessels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Create Enquiry'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>New Cargo Enquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Origin Port</label>
                <Input required list="ports-list" value={formData.origin_port_id} onChange={e => setFormData({...formData, origin_port_id: e.target.value.toUpperCase()})} placeholder="Type to search port..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Destination Port</label>
                <Input required list="ports-list" value={formData.destination_port_id} onChange={e => setFormData({...formData, destination_port_id: e.target.value.toUpperCase()})} placeholder="Type to search port..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Commodity</label>
                <Select value={formData.commodity} onValueChange={v => setFormData({...formData, commodity: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGO_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity (Tons)</label>
                <Input required type="number" value={formData.cargo_quantity_tons} onChange={e => setFormData({...formData, cargo_quantity_tons: e.target.value})} placeholder="100000" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Earliest Charter Date</label>
                <Input required type="date" value={formData.earliest_charter_date} onChange={e => setFormData({...formData, earliest_charter_date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Required Arrival Date</label>
                <Input required type="date" value={formData.required_arrival_date} onChange={e => setFormData({...formData, required_arrival_date: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preferred Vessel Class</label>
                <Select value={formData.preferred_vessel_class} onValueChange={v => setFormData({...formData, preferred_vessel_class: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vessel Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {VESSEL_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <datalist id="ports-list">
                {portsList.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </datalist>
              
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Enquiry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search cargo, origin, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Matched">Matched</SelectItem>
              <SelectItem value="Chartered">Chartered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cargoTypeFilter} onValueChange={setCargoTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Cargo Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cargo Types</SelectItem>
              <SelectItem value="Coal">Coal</SelectItem>
              <SelectItem value="Iron Ore">Iron Ore</SelectItem>
              <SelectItem value="Bauxite">Bauxite</SelectItem>
              <SelectItem value="Fertilizer">Fertilizer</SelectItem>
              <SelectItem value="Grain">Grain</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enquiry ID</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Laycan</TableHead>
              <TableHead>Preferred Vessel</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">{String(enquiry.id).toUpperCase()}</TableCell>
                <TableCell>{enquiry.cargoType}</TableCell>
                <TableCell>{enquiry.origin}</TableCell>
                <TableCell>{enquiry.destination}</TableCell>
                <TableCell>{formatNumber(enquiry.quantity)} MT</TableCell>
                <TableCell className="text-sm">
                  {new Date(enquiry.laycanStart).toLocaleDateString()} -{' '}
                  {new Date(enquiry.laycanEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>{enquiry.preferredVesselType || '-'}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(enquiry.priority)}>
                    {enquiry.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to={`/enquiries/cargo/${enquiry.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredEnquiries.length} of {enquiries.length} enquiries
      </div>
    </div>
  )
}

