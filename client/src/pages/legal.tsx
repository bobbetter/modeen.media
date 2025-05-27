import { Link } from "wouter";
import { ArrowLeft, Building2, Mail, Phone, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Legal() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <span className="text-xl font-light tracking-tight text-gray-800">
              mo<span className="font-bold">deen</span><span className="text-primary font-light">.media</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Information</h1>
            <p className="text-lg text-gray-600">Imprint and Privacy Policy</p>
          </div>

          {/* Imprint Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-primary" />
                Imprint
              </CardTitle>
              <CardDescription>Company Information and Legal Details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Company Details</h3>
                    <p className="text-gray-600">
                      [Company Name]<br />
                      [Street Address]<br />
                      [Postal Code] [City]<br />
                      [Country]
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Registration</h3>
                    <p className="text-gray-600">
                      Commercial Register: [Register Number]<br />
                      VAT ID: [VAT Number]<br />
                      Tax Number: [Tax Number]
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </h3>
                    <p className="text-gray-600">
                      Email: [contact@modeen.media]<br />
                      Phone: [+XX XXX XXX XXXX]<br />
                      Fax: [+XX XXX XXX XXXX]
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Managing Director</h3>
                    <p className="text-gray-600">
                      [Director Name]<br />
                      [Director Title]
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Responsible for Content</h3>
                <p className="text-gray-600">
                  According to § 55 Abs. 2 RStV:<br />
                  [Responsible Person Name]<br />
                  [Address if different from company address]
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Privacy Policy
              </CardTitle>
              <CardDescription>How we handle your personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Data Protection at a Glance</h3>
                <div className="space-y-3 text-gray-600">
                  <p>
                    The following information provides a simple overview of what happens to your personal data when you visit our website. 
                    Personal data is any data that can be used to identify you personally.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Data Collection on Our Website</h3>
                <div className="space-y-3 text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Who is responsible for data collection?</h4>
                    <p>
                      Data processing on this website is carried out by the website operator. You can find their contact details 
                      in the imprint of this website.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">How do we collect your data?</h4>
                    <p>
                      Your data is collected when you provide it to us. This could be data that you enter into a contact form, 
                      for example. Other data is collected automatically by our IT systems when you visit the website.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Your Rights</h3>
                <div className="space-y-3 text-gray-600">
                  <p>You have the following rights regarding your personal data:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Right to information</li>
                    <li>Right to rectification</li>
                    <li>Right to restriction of processing</li>
                    <li>Right to deletion</li>
                    <li>Right to notification</li>
                    <li>Right to data portability</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Analytics and Third-Party Tools</h3>
                <div className="space-y-3 text-gray-600">
                  <p>
                    When visiting our website, your browsing behavior may be statistically analyzed. This is done primarily 
                    with cookies and analytics programs. The analysis of your browsing behavior is usually anonymous.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Contact Information</h3>
                <div className="space-y-3 text-gray-600">
                  <p>
                    If you have any questions about data protection, please email us or contact the person responsible 
                    for data protection in our organization listed in the imprint.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 py-8">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </main>
    </div>
  );
} 