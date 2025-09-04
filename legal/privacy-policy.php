<?php
// Load WordPress if not already loaded
if (!defined('ABSPATH')) {
    // Find WordPress wp-config.php
    $config_file = '';
    for ($i = 0; $i < 5; $i++) {
        $path = str_repeat('../', $i) . 'wp-config.php';
        if (file_exists($path)) {
            $config_file = $path;
            break;
        }
    }
    
    if ($config_file) {
        require_once($config_file);
    }
}

// Get parish information from settings
$parish_name = get_option('matthew_connector_parish_name', 'Our Parish');
$parish_phone = get_option('matthew_connector_parish_phone', '[Parish Phone Number]');
$parish_email = get_option('matthew_connector_parish_email', 'privacy@parish.org');
$parish_address = get_option('matthew_connector_parish_address', '[Parish Address]');
$jurisdiction = get_option('matthew_connector_jurisdiction', '[Your Jurisdiction]');

// Get the current date for effective date
$effective_date = date('F j, Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - <?php echo esc_html($parish_name); ?></title>
    <link rel="stylesheet" href="legal-documents.css">
</head>
<body>
    <div class="container">
        <header class="document-header">
            <h1>Privacy Policy</h1>
            <p class="effective-date">Effective Date: <?php echo esc_html($effective_date); ?></p>
        </header>

        <main class="document-content">
            <section class="intro-section">
                <h2>1. Introduction</h2>
                <p>This Privacy Policy describes how <?php echo esc_html($parish_name); ?> ("we," "our," or "the Parish") collects, uses, and protects your personal information when you use our parish management services.</p>
                <p>We are committed to protecting your privacy and handling your data in accordance with applicable data protection laws and regulations.</p>
            </section>

            <section class="data-collection">
                <h2>2. Information We Collect</h2>
                
                <h3>2.1 Personal Information</h3>
                <p>We collect the following types of personal information:</p>
                <ul>
                    <li><strong>Identity Information:</strong> First name, last name, ID number, date of birth</li>
                    <li><strong>Contact Information:</strong> Email address, phone numbers, physical address</li>
                    <li><strong>Household Information:</strong> Household composition and relationships</li>
                    <li><strong>Religious Records:</strong> Baptism, First Communion, and Confirmation details including dates and parishes</li>
                    <li><strong>Authentication Data:</strong> Login credentials and API tokens</li>
                    <li><strong>Media Files:</strong> Documents and images related to your membership</li>
                </ul>

                <h3>2.2 Technical Information</h3>
                <p>We automatically collect certain technical information when you use our services:</p>
                <ul>
                    <li>IP addresses and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage patterns and access logs</li>
                    <li>API usage statistics</li>
                </ul>
            </section>

            <section class="data-usage">
                <h2>3. How We Use Your Information</h2>
                <p>We use your personal information for the following purposes:</p>
                <ul>
                    <li><strong>Parish Administration:</strong> Managing membership records and household information</li>
                    <li><strong>Communication:</strong> Contacting members for parish activities and important announcements</li>
                    <li><strong>Sacramental Records:</strong> Maintaining accurate records of baptisms, communions, and confirmations</li>
                    <li><strong>Service Provision:</strong> Providing access to parish management features and API services</li>
                    <li><strong>Security:</strong> Protecting against unauthorized access and maintaining system security</li>
                    <li><strong>Legal Compliance:</strong> Meeting our legal obligations and protecting our rights</li>
                </ul>
            </section>

            <section class="data-sharing">
                <h2>4. Information Sharing</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                <ul>
                    <li><strong>Parish Staff:</strong> With authorized parish personnel who need access to perform their duties</li>
                    <li><strong>Service Providers:</strong> With third-party service providers who assist in operating our system (under strict confidentiality agreements)</li>
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or other legal process</li>
                    <li><strong>Emergency Situations:</strong> To protect the safety and security of individuals or the parish community</li>
                </ul>
            </section>

            <section class="data-security">
                <h2>5. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul>
                    <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                    <li><strong>Access Controls:</strong> Role-based permissions limit access to authorized personnel only</li>
                    <li><strong>Authentication:</strong> Secure token-based authentication system</li>
                    <li><strong>Regular Updates:</strong> Security patches and updates are applied regularly</li>
                    <li><strong>Monitoring:</strong> Continuous monitoring for unauthorized access attempts</li>
                </ul>
            </section>

            <section class="data-retention">
                <h2>6. Data Retention</h2>
                <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, including:</p>
                <ul>
                    <li>While you remain a member of the parish</li>
                    <li>For historical and sacramental record-keeping purposes</li>
                    <li>To comply with legal obligations</li>
                    <li>To resolve disputes and enforce our agreements</li>
                </ul>
                <p>You may request deletion of your personal information, subject to our legal obligations to maintain certain records.</p>
            </section>

            <section class="user-rights">
                <h2>7. Your Rights</h2>
                <p>You have the following rights regarding your personal information:</p>
                <ul>
                    <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                    <li><strong>Portability:</strong> Request transfer of your data to another system</li>
                    <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                    <li><strong>Objection:</strong> Object to processing of your personal information in certain situations</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided below.</p>
            </section>

            <section class="cookies">
                <h2>8. Cookies and Tracking</h2>
                <p>Our system uses cookies and similar technologies to:</p>
                <ul>
                    <li>Maintain your login session</li>
                    <li>Remember your preferences</li>
                    <li>Improve system performance</li>
                    <li>Analyze usage patterns</li>
                </ul>
                <p>You can control cookie settings through your browser preferences, though this may affect system functionality.</p>
            </section>

            <section class="third-party">
                <h2>9. Third-Party Services</h2>
                <p>Our system may integrate with third-party services for enhanced functionality. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.</p>
            </section>

            <section class="updates">
                <h2>10. Policy Updates</h2>
                <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by:</p>
                <ul>
                    <li>Posting the updated policy on our system</li>
                    <li>Sending email notifications to registered users</li>
                    <li>Providing notice through the system interface</li>
                </ul>
                <p>Your continued use of our services after any changes constitutes acceptance of the updated policy.</p>
            </section>

            <section class="contact">
                <h2>11. Contact Information</h2>
                <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact:</p>
                <div class="contact-info">
                    <p><strong><?php echo esc_html($parish_name); ?></strong><br>
                    <strong>Data Protection Officer</strong><br>
                    Email: <a href="mailto:<?php echo esc_attr($parish_email); ?>"><?php echo esc_html($parish_email); ?></a><br>
                    <?php if ($parish_phone): ?>Phone: <?php echo esc_html($parish_phone); ?><br><?php endif; ?>
                    <?php if ($parish_address): ?>Address: <?php echo nl2br(esc_html($parish_address)); ?><?php endif; ?></p>
                </div>
            </section>

            <section class="jurisdiction">
                <h2>12. Governing Law</h2>
                <p>This Privacy Policy is governed by the laws of <?php echo esc_html($jurisdiction); ?> and any disputes will be resolved in the courts of <?php echo esc_html($jurisdiction); ?>.</p>
            </section>
        </main>

        <footer class="document-footer">
            <p class="last-updated">Last updated: <?php echo esc_html($effective_date); ?></p>
        </footer>
    </div>
</body>
</html>