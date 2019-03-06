// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace sample
{
    /// <summary>
    /// User state properties for Greeting.
    /// </summary>
    public class userState
    {
        public int step { get; set; }
        public Dictionary<string, string> props;
    }
}
