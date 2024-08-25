#!/usr/bin/env python
# coding: utf-8

# In[77]:


# Calls necessary packages
import pandas as pd
import sqlite3
import numpy as np


# In[109]:


# load required dataset
WPdata_df = pd.read_excel("datasets/1990_02-2023_06_Western_Port_Water_quality_data.xlsx", sheet_name='Data')
GLdata_df = pd.read_excel("datasets/1990_01-2023_06_Gippsland_Lakes_Water_quality_data.xlsx", sheet_name='Data')
PPBdata_df = pd.read_excel("datasets/1984_07-2023_06_Port_Phillip_Bay_Water_quality_data.xlsx", sheet_name='Data')


# In[110]:


# load metadata (lookup table)
WPmeta_df = pd.read_excel("datasets/1990_02-2023_06_Western_Port_Water_quality_data.xlsx", sheet_name='Site Metadata')
GLmeta_df = pd.read_excel("datasets/1990_01-2023_06_Gippsland_Lakes_Water_quality_data.xlsx", sheet_name='Site Metadata')
PPBmeta_df = pd.read_excel("datasets/1984_07-2023_06_Port_Phillip_Bay_Water_quality_data.xlsx", sheet_name='Site Metadata')


# In[111]:


Site = pd.concat([WPmeta_df, GLmeta_df , PPBmeta_df], ignore_index=True)


# In[112]:


# select only needed columns
Site = Site.drop(['site_name_long'], axis=1)


# In[113]:


Water = pd.concat([WPdata_df, GLdata_df , PPBdata_df], ignore_index=True)


# In[114]:


# drop overlapped info with site and non-interested columns
Water = Water.drop(['site_name_short', 'water_body', 'Secchi_depth_m'], axis=1)


# In[115]:


# handle NaN case with Null (None) in sql
Water  = Water .replace({np.nan: None})


# In[116]:


# Sort record with date
Water = Water.sort_values(by='date')


# In[117]:


# Create a record ID column with zero-padded numbers
Water['case_id'] = [f'{i+1:06}' for i in range(len(Water))]

# Reorder columns to place Record_ID at the beginning
cols = ['case_id'] + [col for col in Water.columns if col != 'case_id']
Water = Water[cols]


# In[118]:


# connect sqlite database
conn = sqlite3.connect('water_monitor.db')
cursor = conn.cursor()


# In[119]:


Water.to_sql('water_observation', conn, if_exists='append', index=False)
Site.to_sql('site', conn, if_exists='append', index=False)


# In[120]:


# Commit the changes and close the connection
conn.commit()
conn.close()

