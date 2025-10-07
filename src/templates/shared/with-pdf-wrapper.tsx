import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, typography, spacing } from './design-tokens';

export type DocumentConfig<T> = {
  getDocumentProps: (data: T) => {
    author: string;
    subject: string;
    title: string;
  };
  transformData?: (data: any) => T;
  emptyStateMessage: string;
};

type WithDocumentWrapperProps<T> = {
  data?: T;
  config: DocumentConfig<T>;
  children: (data: T) => React.ReactElement;
};

/**
 * Higher-Order Component that wraps PDF Page components with Document logic
 * Handles: empty states, data transformation, and Document metadata
 *
 * Usage (render prop pattern):
 * <WithDocumentWrapper data={data} config={config}>
 *   {(transformedData) => <Resume data={transformedData} />}
 * </WithDocumentWrapper>
 */
export function WithPDFWrapper<T>({
  data,
  config,
  children,
}: WithDocumentWrapperProps<T>): React.ReactElement {
  // Handle empty state
  if (!data) {
    return (
      <Document title="No Data Available">
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <Text style={styles.text}>{config.emptyStateMessage}</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Transform data if transformation function is provided
  const transformedData = config.transformData ? config.transformData(data) : data;

  // Get document metadata
  const docProps = config.getDocumentProps(transformedData);

  // Call children function with transformed data
  const pageComponent = children(transformedData);

  // Render document with page component
  return <Document {...docProps}>{pageComponent}</Document>;
}

// Shared empty state styles
const styles = StyleSheet.create({
  page: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
  container: {
    padding: 50,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 100,
  },
});
