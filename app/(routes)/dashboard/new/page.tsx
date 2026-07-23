import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import WebsiteForm from './_components/website-form'

const AddWebsite = () => {
  return (
    <div className='flex justify-center items-center mt-10 w-full'>
        <div className='max-w-lg flex flex-col items-start w-full'>
            <Button variant="outline"><ArrowLeft />Dashboard</Button>
            <div className="mt-10 w-full">
                <WebsiteForm />
            </div>
        </div>
    </div>
  )
}

export default AddWebsite