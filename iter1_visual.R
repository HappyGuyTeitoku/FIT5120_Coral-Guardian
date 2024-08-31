library(shiny)
library(leaflet)
library(plotly)
library(dplyr)
library(RSQLite)

# Establish a connection to the SQLite database
db_file <- "water_monitor.db"
conn <- dbConnect(SQLite(), dbname = db_file)

# Load data from the SQLite database
site_data <- dbGetQuery(conn, "SELECT * FROM site")
water_observation <- dbGetQuery(conn, "SELECT * FROM water_observation")

# Close the database connection
dbDisconnect(conn)

# Convert the date column to a Date object for easier handling
water_observation$date <- as.Date(water_observation$date)

# Convert all relevant columns to numeric to prevent errors
water_observation <- water_observation %>%
  mutate(
    N_TOTAL = as.numeric(N_TOTAL),
    P_TOTAL = as.numeric(P_TOTAL),
    N_NH3 = as.numeric(N_NH3),
    N_NO2 = as.numeric(N_NO2),
    N_NO3 = as.numeric(N_NO3),
    N_NOX = as.numeric(N_NOX),
    P_PO4 = as.numeric(P_PO4)
  )

# Filter the most recent data for each site and each day
latest_data <- water_observation %>%
  group_by(site_id, date) %>%
  filter(row_number(desc(date)) == 1) %>% # Keep only the most recent record for each site per day
  ungroup() %>%
  group_by(site_id) %>%
  filter(date == max(date)) %>% # Keep only the most recent date for each site
  select(site_id, date, N_TOTAL, P_TOTAL, N_NH3, N_NO2, N_NO3, N_NOX, P_PO4)

# Join the site data with the latest observation data
merged_data <- left_join(site_data, latest_data, by = "site_id")

ui <- fluidPage(
  titlePanel("Water Quality Dashboard"),
  
  fluidRow(
    column(
      width = 6,
      leafletOutput("map") # Map on the left
    ),
    column(
      width = 6,
      plotlyOutput("sunburst"), # Composition Chart
      selectInput("trend_variable", "Choose Chemical for Trend Analysis:",
                  choices = c("Total Nitrogen", "Total Phosphate", "Nitrate Dioxide", 
                              "Nitrate Nitrogen", "Oxidized Nitrogen", "Phosphate")), # Toolbox for chemical selection
      plotlyOutput("trend") # Historical Trend Analysis
    )
  )
)

server <- function(input, output, session) {
  
  # Reactive value to store the selected site ID from the map
  selected_site <- reactiveVal(NULL)
  
  # Leaflet map visualization
  output$map <- renderLeaflet({
    leaflet(data = merged_data) %>%
      addProviderTiles(providers$CartoDB.Positron) %>% # Use CartoDB tiles
      addMarkers(
        ~longitude, ~latitude,
        popup = ~paste(
          "<b>Name:</b>", site_name_short,
          "<br><b>Update:</b>", format(date, "%d/%m/%Y"),
          "<br><b>Total Nitrogen:</b>", ifelse(is.na(N_TOTAL), "N/A", paste(round(N_TOTAL, 3), "ug/L")),
          "<br><b>Total Phosphate:</b>", ifelse(is.na(P_TOTAL), "N/A", paste(round(P_TOTAL, 3), "ug/L"))
        ),
        layerId = ~site_id # Set layerId to site_id for click events
      )
  })
  
  # Update selected site based on marker click
  observeEvent(input$map_marker_click, {
    site_id_clicked <- input$map_marker_click$id
    selected_site(site_id_clicked) # Update the reactive value with the clicked site ID
  })
  
  # Sunburst Diagram
  output$sunburst <- renderPlotly({
    req(selected_site()) # Ensure a site is selected
    
    # Get the most recent data for the selected site
    site_data_selected <- merged_data %>% filter(site_id == selected_site())
    
    # Check if there's valid data or if P_TOTAL and N_TOTAL are missing
    if (nrow(site_data_selected) == 0 || is.na(site_data_selected$P_TOTAL) || is.na(site_data_selected$N_TOTAL)) {
      # Display "Data Unavailable" if there's no data or N_TOTAL or P_TOTAL are N/A
      plot_ly() %>%
        layout(
          title = paste("Composition Analysis for Site:", ifelse(nrow(site_data_selected) > 0, site_data_selected$site_name_short, "Unknown")),
          annotations = list(
            x = 0.5, y = 0.5, text = "Data Unavailable", showarrow = FALSE,
            xref = "paper", yref = "paper", font = list(size = 20, color = "red")
          )
        )
    } else {
      # Prepare sunburst data for the selected site
      labels <- c("Total Nitrogen", "Total Phosphate", "Ammonia", "Nitrate Dioxide", "Nitrate Nitrogen", "Oxidized Nitrogen", "Phosphate")
      parents <- c("", "", "Total Nitrogen", "Total Nitrogen", "Total Nitrogen", "Total Nitrogen", "Total Phosphate")
      values <- c(site_data_selected$N_TOTAL, 
                  site_data_selected$P_TOTAL,
                  site_data_selected$N_NH3, 
                  site_data_selected$N_NO2, 
                  site_data_selected$N_NO3, 
                  site_data_selected$N_NOX, 
                  site_data_selected$P_PO4)
      
      # Replace any NA values in the subcomponents with 0
      values[is.na(values)] <- 0
      
      # Filter out any missing values
      sunburst_data <- data.frame(labels, parents, values) %>%
        filter(values > 0) # Exclude zero values
      
      plot_ly(sunburst_data, labels = ~labels, parents = ~parents, values = ~values, 
              type = "sunburst", branchvalues = "total",
              textinfo = "label+percent parent") %>%
        layout(title = paste("Composition Analysis for Site:", site_data_selected$site_name_short))
    }
  })
  
  # Historical Trend Analysis
  output$trend <- renderPlotly({
    req(selected_site()) # Ensure a site is selected
    
    # Map the selected variable to the original column names
    selected_variable <- switch(input$trend_variable,
                                "Total Nitrogen" = "N_TOTAL",
                                "Total Phosphate" = "P_TOTAL",
                                "Ammonia" = "N_NH3",
                                "Nitrate Dioxide" = "N_NO2",
                                "Nitrate Nitrogen" = "N_NO3",
                                "Oxidized Nitrogen" = "N_NOX",
                                "Phosphate" = "P_PO4")
    
    # Get all historical data for the selected site
    trend_data <- water_observation %>%
      filter(site_id == selected_site()) %>%
      select(date, trend_var = all_of(selected_variable)) %>%
      mutate(trend_var = as.numeric(trend_var)) # Convert to numeric for plotting
    
    if (nrow(trend_data) == 0) return(NULL) # Check if data exists
    
    # Determine the y-axis label based on the selected chemical
    y_axis_label <- switch(input$trend_variable,
                           "Total Nitrogen" = "Total Nitrogen [ug/L]",
                           "Total Phosphate" = "Total Phosphate [ug/L]",
                           "Ammonia" = "Ammonia [ug/L]",
                           "Nitrate Dioxide" = "Nitrate Dioxide [ug/L]",
                           "Nitrate Nitrogen" = "Nitrate Nitrogen [ug/L]",
                           "Oxidized Nitrogen" = "Oxidized Nitrogen [mg/L]",
                           "Phosphate" = "Phosphate [ug/L]"
    )
    
    plot_ly(trend_data, x = ~date, y = ~trend_var, type = 'scatter', mode = 'lines',
            hoverinfo = "text",
            text = ~paste(input$trend_variable, ": ", round(trend_var, 3), ", Date: ", format(date, "%d/%m/%Y"))) %>%
      layout(title = paste(input$trend_variable, "Trend for", merged_data$site_name_short[merged_data$site_id == selected_site()]),
             yaxis = list(title = y_axis_label))
  })
}

shinyApp(ui, server)

