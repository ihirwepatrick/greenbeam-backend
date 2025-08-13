const prisma = require('../models');

class SettingsController {
  // Get all settings grouped by category
  static async getAllSettings() {
    try {
      const settings = await prisma.settings.findMany({
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

      // Group settings by category
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = {};
        }
        
        // Parse value based on type
        let parsedValue = setting.value;
        if (setting.type === 'json' && setting.value) {
          try {
            parsedValue = JSON.parse(setting.value);
          } catch (error) {
            console.warn(`Failed to parse JSON for setting ${setting.category}.${setting.key}`);
            parsedValue = setting.value;
          }
        } else if (setting.type === 'boolean') {
          parsedValue = setting.value === 'true';
        } else if (setting.type === 'number') {
          parsedValue = parseFloat(setting.value);
        }

        acc[setting.category][setting.key] = parsedValue;
        return acc;
      }, {});

      return {
        success: true,
        data: groupedSettings
      };
    } catch (error) {
      console.error('[SETTINGS] Error fetching all settings:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  // Get settings by category
  static async getSettingsByCategory(category) {
    try {
      const settings = await prisma.settings.findMany({
        where: { category },
        orderBy: { key: 'asc' }
      });

      const categorySettings = {};
      settings.forEach(setting => {
        let parsedValue = setting.value;
        if (setting.type === 'json' && setting.value) {
          try {
            parsedValue = JSON.parse(setting.value);
          } catch (error) {
            console.warn(`Failed to parse JSON for setting ${setting.category}.${setting.key}`);
            parsedValue = setting.value;
          }
        } else if (setting.type === 'boolean') {
          parsedValue = setting.value === 'true';
        } else if (setting.type === 'number') {
          parsedValue = parseFloat(setting.value);
        }

        categorySettings[setting.key] = parsedValue;
      });

      return {
        success: true,
        data: categorySettings
      };
    } catch (error) {
      console.error(`[SETTINGS] Error fetching ${category} settings:`, error);
      throw new Error(`Failed to fetch ${category} settings`);
    }
  }

  // Update settings by category
  static async updateSettingsByCategory(category, settingsData) {
    try {
      const updates = [];
      const settings = Object.entries(settingsData);

      for (const [key, value] of settings) {
        let stringValue = value;
        let type = 'string';

        // Determine type and convert to string
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value);
          type = 'json';
        } else if (typeof value === 'boolean') {
          stringValue = value.toString();
          type = 'boolean';
        } else if (typeof value === 'number') {
          stringValue = value.toString();
          type = 'number';
        }

        updates.push(
          prisma.settings.upsert({
            where: {
              category_key: {
                category,
                key
              }
            },
            update: {
              value: stringValue,
              type,
              updatedAt: new Date()
            },
            create: {
              category,
              key,
              value: stringValue,
              type
            }
          })
        );
      }

      await prisma.$transaction(updates);

      // Return updated settings
      return await this.getSettingsByCategory(category);
    } catch (error) {
      console.error(`[SETTINGS] Error updating ${category} settings:`, error);
      throw new Error(`Failed to update ${category} settings`);
    }
  }

  // Update a single setting
  static async updateSetting(category, key, value) {
    try {
      let stringValue = value;
      let type = 'string';

      // Determine type and convert to string
      if (typeof value === 'object' && value !== null) {
        stringValue = JSON.stringify(value);
        type = 'json';
      } else if (typeof value === 'boolean') {
        stringValue = value.toString();
        type = 'boolean';
      } else if (typeof value === 'number') {
        stringValue = value.toString();
        type = 'number';
      }

      const setting = await prisma.settings.upsert({
        where: {
          category_key: {
            category,
            key
          }
        },
        update: {
          value: stringValue,
          type,
          updatedAt: new Date()
        },
        create: {
          category,
          key,
          value: stringValue,
          type
        }
      });

      // Parse the value for response
      let parsedValue = setting.value;
      if (setting.type === 'json' && setting.value) {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch (error) {
          parsedValue = setting.value;
        }
      } else if (setting.type === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'number') {
        parsedValue = parseFloat(setting.value);
      }

      return {
        success: true,
        data: {
          category: setting.category,
          key: setting.key,
          value: parsedValue,
          type: setting.type,
          updatedAt: setting.updatedAt
        }
      };
    } catch (error) {
      console.error(`[SETTINGS] Error updating setting ${category}.${key}:`, error);
      throw new Error(`Failed to update setting ${category}.${key}`);
    }
  }

  // Delete a setting
  static async deleteSetting(category, key) {
    try {
      await prisma.settings.delete({
        where: {
          category_key: {
            category,
            key
          }
        }
      });

      return {
        success: true,
        message: `Setting ${category}.${key} deleted successfully`
      };
    } catch (error) {
      console.error(`[SETTINGS] Error deleting setting ${category}.${key}:`, error);
      throw new Error(`Failed to delete setting ${category}.${key}`);
    }
  }

  // Initialize default settings
  static async initializeDefaultSettings() {
    try {
      const defaultSettings = {
        general: {
          companyName: 'Greenbeam',
          companyEmail: 'info@greenbeam.com',
          companyPhone: '+250 788 123 456',
          companyAddress: 'Kigali, Rwanda',
          timezone: 'Africa/Kigali',
          currency: 'RWF',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'noreply@greenbeam.com',
          smtpPassword: '',
          fromName: 'Greenbeam Team',
          fromEmail: 'noreply@greenbeam.com',
          replyTo: 'support@greenbeam.com'
        },
        notifications: {
          emailNotifications: true,
          adminEmail: 'admin@greenbeam.com',
          enquiryNotifications: true,
          systemNotifications: true,
          notificationFrequency: 'immediate'
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          twoFactorAuth: false
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily',
          backupRetention: 30,
          backupLocation: 'cloud'
        },
        website: {
          branding: {
            logo: '',
            favicon: '',
            primaryColor: '#0a6650',
            secondaryColor: '#084c3d',
            accentColor: '#10b981',
            fontFamily: 'Inter',
            fontSize: '16px',
            buttonStyle: 'rounded',
            borderRadius: '8px'
          },
          content: {
            siteTitle: 'Greenbeam - Sustainable Energy Solutions',
            siteDescription: 'Leading provider of solar energy solutions in Rwanda',
            homepageHero: {
              title: 'Powering Rwanda\'s Future',
              subtitle: 'Sustainable solar energy solutions for homes and businesses',
              ctaText: 'Explore Products',
              ctaLink: '/products',
              backgroundImage: '',
              showOverlay: true,
              overlayOpacity: 0.6
            },
            aboutSection: {
              title: 'About Greenbeam',
              content: 'We are committed to providing sustainable energy solutions...',
              showTeam: true,
              showStats: true,
              stats: [
                {
                  label: 'Projects Completed',
                  value: '500+',
                  icon: 'check-circle'
                },
                {
                  label: 'Happy Customers',
                  value: '1000+',
                  icon: 'users'
                }
              ]
            },
            contactInfo: {
              address: 'Kigali, Rwanda',
              phone: '+250 788 123 456',
              email: 'info@greenbeam.com',
              workingHours: 'Mon-Fri: 8AM-6PM',
              mapLocation: {
                latitude: -1.9441,
                longitude: 30.0619,
                zoom: 15
              },
              showMap: true,
              showContactForm: true
            },
            footer: {
              showNewsletter: true,
              newsletterTitle: 'Stay Updated',
              newsletterDescription: 'Get the latest updates on our products and services',
              showSocialLinks: true,
              copyrightText: '© 2024 Greenbeam. All rights reserved.'
            }
          },
          seo: {
            metaTitle: 'Greenbeam - Solar Energy Solutions Rwanda',
            metaDescription: 'Leading solar energy provider in Rwanda. Sustainable solutions for homes and businesses.',
            metaKeywords: 'solar energy, Rwanda, renewable energy, solar panels',
            ogImage: '',
            twitterCard: 'summary_large_image',
            googleAnalyticsId: '',
            googleTagManagerId: '',
            sitemapEnabled: true,
            robotsTxt: 'User-agent: *\nAllow: /'
          },
          social: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: '',
            youtube: '',
            showSocialIcons: true,
            socialIconsPosition: 'footer',
            socialShareEnabled: true
          },
          features: {
            enableBlog: true,
            enableNewsletter: true,
            enableReviews: false,
            enableChat: true,
            enableSearch: true,
            enableFilters: true,
            productsPerPage: 12,
            enablePagination: true,
            enableRelatedProducts: true,
            enableProductComparison: false,
            enableWishlist: false,
            enableProductCategories: true,
            enableProductTags: true
          },
          layout: {
            headerStyle: 'fixed',
            showBreadcrumbs: true,
            sidebarPosition: 'right',
            productGridColumns: 3,
            showProductImages: true,
            imageAspectRatio: '16:9',
            enableLazyLoading: true,
            showLoadingSpinner: true
          },
          performance: {
            enableCaching: true,
            cacheDuration: 3600,
            enableCompression: true,
            enableCDN: true,
            cdnUrl: '',
            imageOptimization: true,
            lazyLoadImages: true
          },
          customization: {
            customCSS: '',
            customJS: '',
            enableCustomThemes: false,
            themeMode: 'light',
            enableDarkMode: false,
            customFonts: [],
            enableAnimations: true,
            animationSpeed: 'normal'
          }
        }
      };

      const updates = [];
      
      for (const [category, settings] of Object.entries(defaultSettings)) {
        for (const [key, value] of Object.entries(settings)) {
          let stringValue = value;
          let type = 'string';

          if (typeof value === 'object' && value !== null) {
            stringValue = JSON.stringify(value);
            type = 'json';
          } else if (typeof value === 'boolean') {
            stringValue = value.toString();
            type = 'boolean';
          } else if (typeof value === 'number') {
            stringValue = value.toString();
            type = 'number';
          }

          updates.push(
            prisma.settings.upsert({
              where: {
                category_key: {
                  category,
                  key
                }
              },
              update: {
                value: stringValue,
                type,
                updatedAt: new Date()
              },
              create: {
                category,
                key,
                value: stringValue,
                type
              }
            })
          );
        }
      }

      await prisma.$transaction(updates);

      return {
        success: true,
        message: 'Default settings initialized successfully'
      };
    } catch (error) {
      console.error('[SETTINGS] Error initializing default settings:', error);
      throw new Error('Failed to initialize default settings');
    }
  }

  // Get website settings (flattened structure)
  static async getWebsiteSettings() {
    try {
      const websiteSettings = await this.getSettingsByCategory('website');
      
      // Flatten the nested structure for easier access
      const flattened = {};
      
      const flattenObject = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenObject(value, `${prefix}${key}.`);
          } else {
            flattened[`${prefix}${key}`] = value;
          }
        }
      };

      flattenObject(websiteSettings.data);
      
      return {
        success: true,
        data: flattened
      };
    } catch (error) {
      console.error('[SETTINGS] Error fetching website settings:', error);
      throw new Error('Failed to fetch website settings');
    }
  }

  // Update website settings (nested structure)
  static async updateWebsiteSettings(settingsData) {
    try {
      const updates = [];
      
      const flattenObject = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenObject(value, `${prefix}${key}.`);
          } else {
            const fullKey = `${prefix}${key}`;
            let stringValue = value;
            let type = 'string';

            if (typeof value === 'object' && value !== null) {
              stringValue = JSON.stringify(value);
              type = 'json';
            } else if (typeof value === 'boolean') {
              stringValue = value.toString();
              type = 'boolean';
            } else if (typeof value === 'number') {
              stringValue = value.toString();
              type = 'number';
            }

            updates.push({
              category: 'website',
              key: fullKey,
              value: stringValue,
              type
            });
          }
        }
      };

      flattenObject(settingsData);

      // Perform database updates
      const dbUpdates = updates.map(update =>
        prisma.settings.upsert({
          where: {
            category_key: {
              category: update.category,
              key: update.key
            }
          },
          update: {
            value: update.value,
            type: update.type,
            updatedAt: new Date()
          },
          create: {
            category: update.category,
            key: update.key,
            value: update.value,
            type: update.type
          }
        })
      );

      await prisma.$transaction(dbUpdates);

      return {
        success: true,
        message: 'Website settings updated successfully'
      };
    } catch (error) {
      console.error('[SETTINGS] Error updating website settings:', error);
      throw new Error('Failed to update website settings');
    }
  }
}

module.exports = SettingsController; 