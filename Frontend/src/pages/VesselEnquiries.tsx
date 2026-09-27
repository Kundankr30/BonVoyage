import { useState, useEffect } from 'react'
import { Plus, Download, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { api } from '@/lib/api'
import { formatNumber, getStatusColor } from '@/lib/utils'
import type { VesselEnquiry } from '@/types'
import { VESSEL_TYPES } from '@/lib/constants'

export default function VesselEnquiries() {
  const [enquiries, setEnquiries] = useState<VesselEnquiry[]>([])
  const [filteredEnquiries, setFilteredEnquiries] = useState<VesselEnquiry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    vessel_id: '',
    vessel_name: '',
    vessel_type: '',
    dwt: '',
    speed_knots: '',
    fuel_consumption_tpd: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await api.getVesselEnquiries()
      setEnquiries(data)
      setFilteredEnquiries(data)
    } catch (err) {
      console.error('Failed to fetch vessel enquiries:', err)
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
          e.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.vesselType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.openPort.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredEnquiries(filtered)
  }, [searchTerm, statusFilter, enquiries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createVesselEnquiry(formData as any)
      setShowForm(false)
      setFormData({
        vessel_id: '',
        vessel_name: '',
        vessel_type: '',
        dwt: '',
        speed_knots: '',
        fuel_consumption_tpd: '',
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to record vessel:', error)
      alert('Failed to record vessel.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading vessel enquiries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vessel Enquiries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track open vessel positions and identify vessels available for upcoming cargo requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Paste Circular
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Record Vessel'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Record New Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Vessel ID</label>
                <Input required value={formData.vessel_id} onChange={e => setFormData({...formData, vessel_id: e.target.value.toUpperCase()})} placeholder="V00X" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vessel Name</label>
                <Input required value={formData.vessel_name} onChange={e => setFormData({...formData, vessel_name: e.target.value})} placeholder="Bon Voyage" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vessel Type</label>
                <Select value={formData.vessel_type} onValueChange={v => setFormData({...formData, vessel_type: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vessel Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {VESSEL_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">DWT (Tons)</label>
                <Input required type="number" value={formData.dwt} onChange={e => setFormData({...formData, dwt: e.target.value})} placeholder="100000" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Speed (Knots)</label>
                <Input required type="number" step="0.1" value={formData.speed_knots} onChange={e => setFormData({...formData, speed_knots: e.target.value})} placeholder="12.5" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fuel Consumption (TPD)</label>
                <Input required type="number" step="0.1" value={formData.fuel_consumption_tpd} onChange={e => setFormData({...formData, fuel_consumption_tpd: e.target.value})} placeholder="35.0" />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Vessel
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
            placeholder="Search vessel, port..."
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
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Trading Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
              <SelectItem value="indian-ocean">Indian Ocean</SelectItem>
              <SelectItem value="atlantic">Atlantic</SelectItem>
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
              <TableHead>Vessel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>DWT</TableHead>
              <TableHead>Open Date</TableHead>
              <TableHead>Open Port</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Owner/Broker</TableHead>
              <TableHead>Fuel Consumption</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">{enquiry.vesselName}</TableCell>
                <TableCell>{enquiry.vesselType}</TableCell>
                <TableCell>{formatNumber(enquiry.dwt)}</TableCell>
                <TableCell>{new Date(enquiry.openDate).toLocaleDateString()}</TableCell>
                <TableCell>{enquiry.openPort}</TableCell>
                <TableCell>{enquiry.destination || 'Open'}</TableCell>
                <TableCell>{enquiry.ownerBroker}</TableCell>
                <TableCell>{enquiry.fuelConsumption} MT/day</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Post to Marketplace
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredEnquiries.length} of {enquiries.length} vessel enquiries
      </div>
    </div>
  )
}

