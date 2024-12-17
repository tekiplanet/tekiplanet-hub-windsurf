<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServiceQuoteField;

class ServiceQuoteFieldSeeder extends Seeder
{
    public function run()
    {
        $webDevFields = [
            [
                'name' => 'project_type',
                'label' => 'Project Type',
                'type' => 'select',
                'required' => true,
                'options' => ['Corporate Website', 'E-commerce', 'Web Application', 'Custom Solution'],
                'order' => 1
            ],
            [
                'name' => 'technologies',
                'label' => 'Preferred Technologies',
                'type' => 'multi-select',
                'required' => false,
                'options' => ['React', 'Vue', 'Angular', 'Laravel', 'Node.js'],
                'order' => 2
            ]
        ];

        $mobileAppFields = [
            [
                'name' => 'platform',
                'label' => 'Target Platform',
                'type' => 'select',
                'required' => true,
                'options' => ['iOS', 'Android', 'Cross-Platform'],
                'order' => 1
            ],
            [
                'name' => 'app_type',
                'label' => 'App Type',
                'type' => 'select',
                'required' => true,
                'options' => ['Native', 'Hybrid', 'Progressive Web App'],
                'order' => 2
            ]
        ];

        $pentestFields = [
            [
                'name' => 'infrastructure_type',
                'label' => 'Infrastructure Type',
                'type' => 'multi-select',
                'required' => true,
                'options' => ['Web Application', 'Mobile App', 'Network', 'Cloud', 'IoT Devices'],
                'order' => 1
            ],
            [
                'name' => 'testing_scope',
                'label' => 'Testing Scope',
                'type' => 'select',
                'required' => true,
                'options' => ['External', 'Internal', 'Comprehensive'],
                'order' => 2
            ],
            [
                'name' => 'compliance_requirements',
                'label' => 'Compliance Requirements',
                'type' => 'multi-select',
                'required' => false,
                'options' => ['GDPR', 'HIPAA', 'PCI DSS', 'ISO 27001', 'NIST'],
                'order' => 3
            ]
        ];

        $securityAuditFields = [
            [
                'name' => 'organization_size',
                'label' => 'Organization Size',
                'type' => 'select',
                'required' => true,
                'options' => ['Small (1-50 employees)', 'Medium (51-250 employees)', 'Large (251+ employees)'],
                'order' => 1
            ],
            [
                'name' => 'industry_type',
                'label' => 'Industry Type',
                'type' => 'select',
                'required' => true,
                'options' => ['Finance', 'Healthcare', 'Technology', 'Retail', 'Government', 'Education', 'Other'],
                'order' => 2
            ],
            [
                'name' => 'audit_frequency',
                'label' => 'Desired Audit Frequency',
                'type' => 'select',
                'required' => true,
                'options' => ['Quarterly', 'Bi-Annually', 'Annually'],
                'order' => 3
            ]
        ];

        $incidentResponseFields = [
            [
                'name' => 'incident_type',
                'label' => 'Suspected Incident Type',
                'type' => 'select',
                'required' => true,
                'options' => ['Data Breach', 'Malware', 'Phishing', 'DDoS Attack', 'Insider Threat'],
                'order' => 1
            ],
            [
                'name' => 'urgency_level',
                'label' => 'Urgency Level',
                'type' => 'select',
                'required' => true,
                'options' => ['Critical', 'High', 'Medium', 'Low'],
                'order' => 2
            ]
        ];

        $services = [
            'Web Development' => $webDevFields,
            'Mobile App Development' => $mobileAppFields,
            'Penetration Testing' => $pentestFields,
            'Security Audit' => $securityAuditFields,
            'Incident Response' => $incidentResponseFields
        ];

        foreach ($services as $serviceName => $fields) {
            $service = Service::where('name', $serviceName)->first();
            if ($service) {
                foreach ($fields as $fieldData) {
                    $service->quoteFields()->create($fieldData);
                }
            }
        }
    }
}
